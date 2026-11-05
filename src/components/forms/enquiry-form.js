"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { formFields, validateEnquiry } from "@/lib/website/forms";
import { submitEnquiry } from "@/services/website/enquiries.service";
import { submitAppointmentEnquiry } from "@/services/website/appointments.service";
import { localize } from "@/config/website";
import { services } from "@/lib/mock-data/website";
import { Notice } from "@/components/ui/primitives";
import { buttonPrimary, websiteInput, Arrow } from "@/components/website/ui";

function dateToday() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function subscribe(callback) { window.addEventListener("focus", callback); return () => window.removeEventListener("focus", callback); }

export default function EnquiryForm({ kind = "contact", locale, dictionary: d, vehicleReference = "" }) {
  const params = useSearchParams();
  const [values, setValues] = useState(() => ({ type: ["general", "vehicle", "solution", "parts", "fleet"].includes(params.get("type")) ? params.get("type") : "general", service: services.some((s) => s.id === params.get("service")) ? params.get("service") : "" }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const form = useRef(null);
  const prefix = useId();
  const today = useSyncExternalStore(subscribe, dateToday, () => "");
  const fields = formFields(kind);
  const reference = vehicleReference || (params.get("reference") || "").slice(0, 100);
  const options = {
    methods: [{ value: "email", label: d.form.emailMethod }, { value: "phone", label: d.form.phoneMethod }],
    types: ["general", "vehicle", "solution", "parts", "fleet"].map((value, i) => ({ value, label: d.form.contactTypes[i] })),
    branches: ["dubai", "abudhabi", "sharjah", "discuss"].map((value, i) => ({ value, label: d.form.branches[i] })),
    services: services.map((s) => ({ value: s.id, label: localize(s.title, locale) })),
  };
  function change(key, value) { setValues((old) => ({ ...old, [key]: value })); setErrors((old) => ({ ...old, [key]: undefined })); setSuccess(false); setFailed(false); }
  async function submit(event) {
    event.preventDefault(); setSuccess(false); setFailed(false);
    const next = validateEnquiry(values, fields, options, dateToday());
    setErrors(next);
    if (Object.keys(next).length) { form.current.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus(); return; }
    setBusy(true);
    try {
      const action = kind === "service" ? submitAppointmentEnquiry : submitEnquiry;
      await action({ ...values, vehicleReference: reference, kind, locale }, { simulateFailure });
      setSuccess(true);
      setValues({ type: "general", service: "" });
    } catch { setFailed(true); }
    finally { setBusy(false); }
  }
  const title = d.form[kind === "contact" ? "contactTitle" : kind === "vehicle" ? "vehicleTitle" : kind === "drive" ? "driveTitle" : "serviceTitle"];
  return <form ref={form} onSubmit={submit} noValidate aria-busy={busy} className="space-y-5"><div><h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2><p className="mt-2 text-[11px] text-slate-400">{d.form.requiredMark}</p></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">{d.form.privacy}</div>
    {success && <Notice>{d.form.success}</Notice>}{failed && <Notice error>{d.form.error}</Notice>}{Object.values(errors).some(Boolean) && <p role="alert" className="text-xs text-rose-700">{d.form.validationSummary}</p>}
    {reference && <div><span className="text-xs font-semibold text-slate-500">{d.form.reference}</span><p className="mt-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700"><bdi dir="ltr">{reference}</bdi></p></div>}
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">{fields.map((field) => {
      const id = `${prefix}-${field.key}`;
      const shared = { id, name: field.key, value: values[field.key] || "", onChange: (event) => change(field.key, event.target.value), disabled: busy, required: field.required, "aria-invalid": Boolean(errors[field.key]), "aria-describedby": errors[field.key] ? `${id}-error` : undefined, className: `${websiteInput} ${errors[field.key] ? "border-rose-400" : ""}` };
      return <div key={field.key} className={`min-w-0 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}><label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-600">{d.form[field.key]}{field.required ? " *" : ""}</label>{field.type === "select" ? <select {...shared}><option value="">{d.form.select}</option>{options[field.options].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : field.type === "textarea" ? <textarea {...shared} rows={4} maxLength={field.max} /> : <input {...shared} type={field.type} maxLength={field.max} min={field.type === "date" ? today || undefined : undefined} autoComplete={{ name: "name", email: "email", phone: "tel", company: "organization" }[field.key]} dir={["email", "tel"].includes(field.type) ? "ltr" : undefined} />}{errors[field.key] && <p id={`${id}-error`} className="mt-2 text-xs text-rose-700">{d.form[errors[field.key]]}</p>}</div>;
    })}</div>
    <label className="flex min-h-11 items-center gap-3 text-xs text-slate-500"><input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} disabled={busy} className="size-4 shrink-0 accent-teal-700" />{d.form.demoFailure}</label><button type="submit" disabled={busy} className={`${buttonPrimary} w-full sm:w-auto`}>{busy ? d.form.submitting : d.form.submit}{busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" /> : <Arrow />}</button>
  </form>;
}
