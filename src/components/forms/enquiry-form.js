"use client";

import { useSearchParams } from "next/navigation";
import { resolveZohoWebformKind } from "@/config/zohoWebforms";
import ZohoWebform from "./zoho-webform";

export default function EnquiryForm({ kind = "contact", locale, dictionary: d, vehicleReference = "" }) {
  const params = useSearchParams();
  const selected = resolveZohoWebformKind(kind, params.get("request") || "");
  const text = d.form;
  const reference = vehicleReference || (params.get("reference") || "").slice(0, 100);
  return <section data-enquiry-kind={selected} className="min-w-0 space-y-5">
    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{text[selected + "Title"]}</h2>
    {reference && <div><span className="text-xs font-semibold text-slate-600">{text.reference}</span><p className="mt-2 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700"><bdi dir="ltr">{reference}</bdi></p></div>}
    <ZohoWebform key={selected + ":" + locale} kind={selected} locale={locale} />
  </section>;
}
