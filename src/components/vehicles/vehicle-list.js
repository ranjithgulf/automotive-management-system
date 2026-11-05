"use client";

import { useState } from "react";
import { filterVehicles } from "@/services/website/vehicles.service";
import { Container, websiteInput } from "@/components/website/ui";
import VehicleCard, { number } from "@/components/website/vehicle-card";

export default function VehicleList({ vehicles, locale, dictionary: d }) {
  const [filters, setFilters] = useState({ search: "", brand: "", range: "", condition: "", type: "", sort: "newest" });
  const [limit, setLimit] = useState(6);
  const results = filterVehicles(vehicles, filters);
  const labels = d.pages.vehicles;
  const fields = [
    ["brand", [...new Set(vehicles.map((v) => v.brand))].map((v) => [v, v])],
    ["condition", [["new", labels.new], ["used", labels.used]]],
    ["type", [["suv", labels.suv], ["sedan", labels.sedan], ["van", labels.van]]],
    ["range", [["under", labels.under], ["middle", labels.middle], ["over", labels.over]]],
    ["sort", [["newest", labels.newest], ["low", labels.priceLow], ["high", labels.priceHigh]]],
  ];
  function change(key, value) { setFilters((old) => ({ ...old, [key]: value })); setLimit(6); }
  return <section className="py-10 sm:py-14"><Container><div className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"><label className="min-w-0"><span className="mb-2 block text-xs font-semibold text-slate-500">{labels.search}</span><input type="search" value={filters.search} onChange={(e) => change("search", e.target.value)} className={websiteInput} /></label>{fields.map(([key, options]) => <label key={key} className="min-w-0"><span className="mb-2 block text-xs font-semibold text-slate-500">{labels[key]}</span><select value={filters[key]} onChange={(e) => change(key, e.target.value)} className={websiteInput}>{key !== "sort" && <option value="">{labels.all}</option>}{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div><div className="my-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span aria-live="polite">{number(results.length, locale)} {labels.results}</span><button type="button" onClick={() => { setFilters({ search: "", brand: "", range: "", condition: "", type: "", sort: "newest" }); setLimit(6); }} className="min-h-11 px-2 font-semibold text-teal-700 hover:underline">{d.common.clear}</button></div><div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">{results.slice(0, limit).map((v) => <VehicleCard key={v.id} vehicle={v} locale={locale} dictionary={d} />)}</div>{!results.length && <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-16 text-center text-sm text-slate-500">{d.common.empty}</p>}{limit < results.length && <div className="mt-10 text-center"><button type="button" className="min-h-12 rounded-full border border-slate-300 px-8 py-3 text-sm font-semibold hover:border-teal-700 hover:text-teal-700" onClick={() => setLimit((n) => n + 6)}>{d.common.next}</button></div>}<p className="mt-8 max-w-4xl text-[11px] leading-6 text-slate-400">{d.common.sampleNote}</p></Container></section>;
}
