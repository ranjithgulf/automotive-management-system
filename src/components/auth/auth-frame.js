import Brand from "@/components/ui/brand";
import Icon from "@/components/ui/icon";

export default function AuthFrame({ children }) {
  return <div className="grid min-h-dvh bg-white lg:grid-cols-[0.95fr_1.05fr]">
    <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col xl:px-20">
      <div className="absolute -end-40 top-32 size-[550px] rounded-full border border-teal-400/10" /><div className="absolute -end-24 top-48 size-[420px] rounded-full border border-teal-400/10" />
      <div className="relative"><Brand dark /></div>
      <div className="relative my-auto py-20"><span className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/5 px-3 py-1.5 text-xs font-medium text-teal-300"><span className="size-1.5 rounded-full bg-teal-400" />Built for the road ahead</span><h1 className="mt-7 max-w-lg text-5xl leading-[1.15] font-semibold tracking-tight xl:text-6xl">Your entire business.<br /><span className="text-teal-400">In one lane.</span></h1><p className="mt-6 max-w-sm text-base leading-7 text-slate-400">From the showroom to the workshop. A clearer view of your automotive business, across every GCC branch.</p>
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6"><div className="flex items-center justify-between"><span className="text-xs text-slate-400">ONE CONNECTED WORKSPACE</span><Icon name="car" className="size-6 text-teal-400" /></div><div className="mt-6 flex items-center gap-3"><div className="h-1 flex-1 rounded bg-teal-400" /><div className="h-1 flex-1 rounded bg-teal-400/50" /><div className="h-1 flex-1 rounded bg-teal-400/20" /></div><div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-slate-300"><span>Sales & inventory</span><span>Service & parts</span><span>Finance & people</span></div></div></div>
      <div className="relative flex justify-between text-xs text-slate-500"><span>© 2026 AutoFlow GCC</span><span>Designed for the GCC</span></div>
    </aside>
    <div className="flex min-h-dvh min-w-0 flex-col px-4 py-6 sm:px-10 sm:py-8 xl:px-12"><div className="flex flex-wrap items-center justify-between gap-4"><div className="lg:hidden"><Brand /></div><span className="ms-auto rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">FRONTEND PREVIEW</span></div><main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 sm:py-12">{children}</main><p className="text-center text-xs leading-5 text-slate-400">Prototype workspace · No real accounts, permissions, or emails</p></div>
  </div>;
}
