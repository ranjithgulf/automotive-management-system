import Icon from "./icon";

export default function Brand({ dark = false }) {
  return <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm"><Icon name="car" className="size-6" /></span><div><span className={`block text-xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>AutoFlow <span className="text-teal-500">GCC</span></span><span className={`block text-[9px] font-semibold tracking-[0.2em] uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}>Automotive. Connected.</span></div></div>;
}
