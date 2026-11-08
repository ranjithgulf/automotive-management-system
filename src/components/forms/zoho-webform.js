"use client";

import { useEffect, useState } from "react";
import { zohoWebforms } from "@/config/zohoWebforms";

const labels = {
  en: { loading: "Loading enquiry form…", slow: "The form is taking longer to load. If it remains blank, retry loading it.", error: "The form could not be loaded. Please retry.", retry: "Reload form", title: "Secure enquiry form" },
  ar: { loading: "جارٍ تحميل نموذج الاستفسار…", slow: "يستغرق تحميل النموذج وقتًا أطول. إذا بقي فارغًا، أعد تحميله.", error: "تعذر تحميل النموذج. يرجى المحاولة مجددًا.", retry: "إعادة تحميل النموذج", title: "نموذج استفسار آمن" },
};

export default function ZohoWebform({ kind, locale }) {
  const form = zohoWebforms[kind];
  const text = labels[locale] || labels.en;
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("slow"), 20000);
    return () => clearTimeout(timer);
  }, [status, attempt]);
  return <div className="min-w-0">
    <div role="status" aria-live="polite" className="mb-3 text-xs leading-6 text-slate-600">
      {status === "loading" ? text.loading : status === "slow" ? text.slow : status === "error" ? text.error : null}
    </div>
    {["slow", "error", "loaded"].includes(status) && <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }} className="mb-3 min-h-11 rounded-lg border border-slate-300 px-4 text-xs font-semibold text-slate-700 hover:border-teal-600">{text.retry}</button>}
    <iframe key={attempt} data-zoho-webform={kind} src={form.url} title={text.title + " — " + form.title}
      width="100%" height={form.height} className="block w-full max-w-full border-0 bg-white"
      sandbox="allow-forms allow-scripts allow-same-origin allow-modals"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => setStatus("loaded")} onError={() => setStatus("error")} />
  </div>;
}
