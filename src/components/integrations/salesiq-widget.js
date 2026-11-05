"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import Dialog from "@/components/ui/dialog";
import { buttonPrimary } from "@/components/website/ui";
import { pagePath } from "@/config/website";

// Intentionally no external script, token, guessed widget URL, or chat backend.
export default function SalesIQWidget({ locale, dictionary: d }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)} aria-label={d.chat.button} aria-expanded={open} className="fixed end-4 bottom-4 z-30 flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-teal-800 px-4 py-3 text-xs font-semibold text-white shadow-xl transition hover:bg-teal-900 sm:end-6 sm:bottom-6"><Icon name="support" className="size-5" /><span className="hidden sm:inline">{d.chat.button}</span></button><Dialog open={open} onClose={() => setOpen(false)} title={d.chat.title} closeLabel={d.common.close}><p className="text-sm leading-8 text-slate-500">{d.chat.text}</p><Link onClick={() => setOpen(false)} href={pagePath(locale, "contact")} className={`${buttonPrimary} mt-6`}>{d.chat.contact}</Link></Dialog></>;
}
