import Icon from "./icon";

export const inputClass = "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-slate-50";
export const primaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-60";
export const secondaryButton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600";

export function Notice({ children, error = false }) {
  return <div role={error ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-teal-200 bg-teal-50 text-teal-900"}`}><Icon name={error ? "alert" : "check"} className="mt-0.5 size-4 shrink-0" /><div>{children}</div></div>;
}

export function Badge({ children, tone = "slate" }) {
  const tones = { slate: "bg-slate-100 text-slate-600", teal: "bg-teal-50 text-teal-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700", blue: "bg-blue-50 text-blue-700" };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

export function Panel({ title, subtitle, action, children, className = "" }) {
  return <section className={`min-w-0 break-words rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/20 ${className}`}><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}</div>{action}</div>{children}</section>;
}
