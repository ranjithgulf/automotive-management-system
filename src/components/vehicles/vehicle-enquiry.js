"use client";

import { Suspense, useState } from "react";
import Dialog from "@/components/ui/dialog";
import EnquiryForm from "@/components/forms/enquiry-form";
import { buttonPrimary, buttonSecondary } from "@/components/website/ui";

export default function VehicleEnquiry({ vehicle, locale, dictionary: d }) {
  const [mode, setMode] = useState(null);
  return <><div className="grid gap-3"><button type="button" onClick={() => setMode("vehicle")} className={buttonPrimary}>{d.pages.vehicles.enquire}</button><button type="button" onClick={() => setMode("drive")} className={buttonSecondary}>{d.pages.vehicles.drive}</button></div><Dialog open={Boolean(mode)} onClose={() => setMode(null)} title={mode === "drive" ? d.form.driveTitle : d.form.vehicleTitle} closeLabel={d.common.close}><Suspense fallback={<p>{d.common.loading}</p>}><EnquiryForm key={mode} kind={mode || "vehicle"} locale={locale} dictionary={d} vehicleReference={vehicle.reference} /></Suspense></Dialog></>;
}
