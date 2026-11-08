"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { verifiedFormFields, verifiedFormOptions, validateVerifiedForm, verifiedFormValues, dubaiToday } from "@/lib/website/verified-forms";
import { integrationLabels } from "@/lib/website/integration-labels";
import { submitVerifiedEnquiry, enquiryMode } from "@/services/website/enquiries.service";
import Turnstile from "./turnstile";
import { Notice } from "@/components/ui/primitives";
import { buttonPrimary, websiteInput, Arrow } from "@/components/website/ui";

function subscribe(callback) { window.addEventListener("focus", callback); return () => window.removeEventListener("focus", callback); }
const live = enquiryMode === "live";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const action = process.env.NEXT_PUBLIC_ENQUIRY_TURNSTILE_ACTION || "";
const routes = { serviceMode: process.env.NEXT_PUBLIC_ENQUIRY_SERVICE_MODE || "appointment", supportMode: process.env.NEXT_PUBLIC_ENQUIRY_SUPPORT_MODE || "desk" };
const consentVersion = process.env.NEXT_PUBLIC_ENQUIRY_CONSENT_VERSION || "";

export default function EnquiryForm(props) {
  const params = useSearchParams();
  const requested = params.get("request");
  const kind = (!props.kind || props.kind === "contact") && ["vehicle", "drive", "quotation", "trade-in"].includes(requested) ? requested : props.kind || "contact";
  return <EnquiryFields key={props.locale + ":" + kind + ":" + params.toString()} {...props} kind={kind} params={params} />;
}
function EnquiryFields({ kind, locale, dictionary: d, vehicleReference = "", params }) {
  const text = { ...d.form, ...integrationLabels[locale] };
  const reference = vehicleReference || (params.get("reference") || "").slice(0, 100);
  const options = verifiedFormOptions(locale, d);
  const [values, setValues] = useState({ type: options.types.some((item) => item.value === params.get("type")) ? params.get("type") : "general" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [failure, setFailure] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const form = useRef(null), pending = useRef(false), request = useRef(null);
  const prefix = useId();
  const today = useSyncExternalStore(subscribe, dubaiToday, () => "");
  const fields = verifiedFormFields(kind, routes);
  const consentText = locale === "ar" ? process.env.NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_AR : process.env.NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_EN;
  const configured = Boolean(siteKey && /^[a-zA-Z0-9_-]{1,32}$/.test(action) && /^[a-zA-Z0-9._-]{1,80}$/.test(consentVersion) && consentText?.trim());
  const unresolved = ["resultUnknown", "inProgress", "idempotencyConflict"].includes(failure);
  function change(key, value) {
    setValues((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
    setResult(null); setFailure("");
  }
  async function submit(event) {
    event.preventDefault();
    if (pending.current || unresolved) return;
    setResult(null); setFailure("");
    if (live && !configured) { setFailure("notReady"); return; }
    const next = validateVerifiedForm(values, kind, locale, dubaiToday(), routes);
    if (live && !consent) next.consent = "required";
    if (live && !token) next.turnstile = "challengeFailed";
    setErrors(next);
    if (Object.keys(next).length) {
      form.current.querySelector('[name="' + Object.keys(next)[0] + '"]')?.focus();
      return;
    }
    pending.current = true; setBusy(true);
    const payload = { kind, locale, vehicleReference: reference, values: verifiedFormValues(values, kind, routes), consent, consentVersion };
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID() };
    try {
      const response = await submitVerifiedEnquiry({ ...payload, turnstileToken: token, context: { pageUrl: window.location.origin + window.location.pathname,
        ...Object.fromEntries([["utm_source", "utmSource"], ["utm_medium", "utmMedium"], ["utm_campaign", "utmCampaign"]].filter(([key]) => params.has(key)).map(([key, target]) => [target, params.get(key).slice(0, 100)])) } },
        { simulateFailure, idempotencyKey: request.current.key });
      setResult(response); request.current = null; setValues({ type: "general" }); setConsent(false);
    } catch (error) {
      setFailure(!live ? "error" : ["rateLimited", "resultUnknown", "inProgress", "idempotencyConflict", "challengeFailed", "validation"].includes(error.code) ? error.code : "unavailable");
    } finally {
      if (live) { setToken(""); setResetKey((value) => value + 1); }
      pending.current = false; setBusy(false);
    }
  }
  return <form ref={form} onSubmit={submit} noValidate aria-busy={busy} data-enquiry-kind={kind} className="space-y-5">
    <div><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text[kind + "Title"]}</h2><p className="mt-2 text-[11px] text-slate-600">{text.requiredMark}</p></div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">{live ? text.privacyLive : text.privacy}</div>
    {result && <Notice>{result.mode === "demo" ? text.success : text.received}</Notice>}
    {failure && <Notice error>{text[failure]}</Notice>}
    {live && !configured && <Notice error>{text.notReady}</Notice>}
    {Object.values(errors).some(Boolean) && <p role="alert" className="text-xs text-rose-700">{text.validationSummary}</p>}
    {reference && <div><span className="text-xs font-semibold text-slate-600">{text.reference}</span><p className="mt-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700"><bdi dir="ltr">{reference}</bdi></p></div>}
    <fieldset disabled={busy || unresolved} className="grid min-w-0 gap-4 sm:grid-cols-2">{fields.map((field) => {
      const id = prefix + "-" + field.key;
      const description = [errors[field.key] ? id + "-error" : null, field.key === "mobile" ? id + "-hint" : null].filter(Boolean).join(" ") || undefined;
      const shared = { id, name: field.key, value: values[field.key] || "", onChange: (event) => change(field.key, event.target.value), required: field.required, "aria-invalid": Boolean(errors[field.key]), "aria-describedby": description, className: websiteInput + (errors[field.key] ? " border-rose-400" : "") };
      return <div key={field.key} className={"min-w-0 " + (field.type === "textarea" ? "sm:col-span-2" : "")}>
        <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-600">{text[field.key]}{field.required ? " *" : ""}</label>
        {field.type === "select" ? <select {...shared}><option value="">{text.select}</option>{options[field.options].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : field.type === "textarea" ? <textarea {...shared} rows={4} maxLength={field.max} /> : <input {...shared} type={field.type} maxLength={field.max} min={field.type === "date" ? today || undefined : undefined} autoComplete={{ firstName: "given-name", lastName: "family-name", email: "email", mobile: "tel", company: "organization" }[field.key]} dir={["email", "tel"].includes(field.type) ? "ltr" : undefined} />}
        {field.key === "mobile" && <p id={id + "-hint"} className="mt-2 text-[11px] leading-5 text-slate-600">{text.phoneHint}</p>}
        {errors[field.key] && <p id={id + "-error"} className="mt-2 text-xs text-rose-700">{text[errors[field.key]]}</p>}
      </div>;
    })}
    {kind === "drive" && <div className="sm:col-span-2"><label className="flex min-h-11 items-center gap-3 text-xs"><input name="licenceConfirmed" type="checkbox" checked={values.licenceConfirmed || false} onChange={(e) => change("licenceConfirmed", e.target.checked)} required className="size-4 shrink-0" />{text.licenceConfirmed} *</label>{errors.licenceConfirmed && <p role="alert" className="text-xs text-rose-700">{text.required}</p>}</div>}
    {live && configured && <div className="space-y-3 sm:col-span-2"><label className="flex min-h-11 items-start gap-3 text-xs leading-6"><input name="consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((old) => ({ ...old, consent: undefined })); }} required className="mt-1 size-4 shrink-0" />{consentText} *</label>{errors.consent && <p role="alert" className="text-xs text-rose-700">{text.required}</p>}<Turnstile siteKey={siteKey} action={action} locale={locale} resetKey={resetKey} onToken={setToken} />{errors.turnstile && <p role="alert" className="text-xs text-rose-700">{text.challengeFailed}</p>}</div>}
    </fieldset>
    {!live && <label className="flex min-h-11 items-center gap-3 text-xs text-slate-600"><input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} disabled={busy} className="size-4 shrink-0 accent-teal-700" />{text.demoFailure}</label>}
    <button type="submit" disabled={busy || unresolved || live && (!configured || !token)} className={buttonPrimary + " w-full sm:w-auto"}>{busy ? text.submitting : live ? text.submitLive : text.submit}{busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" /> : <Arrow />}</button>
  </form>;
}
