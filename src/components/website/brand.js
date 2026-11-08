/* eslint-disable @next/next/no-img-element -- A fixed-size SVG brand mark needs no runtime image optimization. */
export default function WebsiteBrand({ dictionary, dark = false }) {
  return <span className="flex items-center gap-2.5" dir="ltr"><img src="/assets/branding/icon.svg" width={40} height={36} alt="" aria-hidden="true" className={"h-9 w-10 shrink-0 " + (dark ? "brightness-0 invert" : "")} /><span><span className={`block whitespace-nowrap text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>AutoFlow <span className={dark ? "text-teal-300" : "text-teal-700"}>GCC</span></span><span className={`block text-[8px] ${dark ? "text-slate-400" : "text-slate-600"}`}>{dictionary.common.brandTagline}</span></span></span>;
}
