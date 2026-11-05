"use client";

import { useState } from "react";
import { Photo } from "@/components/website/ui";

export default function VehicleGallery({ vehicle, dictionary: d }) {
  const images = [vehicle.image, vehicle.image === "sedan" ? "hero" : "sedan", "suv"];
  const [active, setActive] = useState(0);
  return <div className="min-w-0"><div className="aspect-[1.45] overflow-hidden rounded-2xl"><Photo name={images[active]} alt={`${d.common.imageNote} · ${vehicle.brand} ${vehicle.model}`} priority /></div><div className="mt-4 grid grid-cols-3 gap-3">{images.map((name, index) => <button type="button" key={`${name}-${index}`} aria-label={`${d.pages.vehicles.selectImage} ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`aspect-[1.55] overflow-hidden rounded-xl border-2 p-0.5 ${active === index ? "border-teal-700" : "border-transparent hover:border-slate-300"}`}><Photo name={name} alt={`${d.common.imageNote} ${index + 1}`} className="rounded-lg" /></button>)}</div><p className="mt-4 text-[11px] leading-6 text-slate-400">{d.common.sampleNote}</p></div>;
}
