"use client";

import { useEffect, useRef } from "react";
import Icon from "./icon";

export default function Dialog({ open, onClose, title, children, drawer = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-label={title} className={drawer ? "fixed inset-y-0 start-0 m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-slate-950 p-0 text-white backdrop:bg-slate-950/60" : "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-2xl border-0 bg-white p-4 sm:p-6 text-slate-900 shadow-xl backdrop:bg-slate-950/50"}>
    <div className={`mb-5 flex items-center justify-between gap-4 ${drawer ? "px-5 pt-5" : ""}`}><h2 className="font-semibold">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-slate-500/10 focus-visible:outline-2 focus-visible:outline-teal-500"><Icon name="close" /></button></div>{children}
  </dialog>;
}
