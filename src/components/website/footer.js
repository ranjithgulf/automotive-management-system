import Link from "next/link";
import { pagePath, mainNavigation } from "@/config/website";
import { Container } from "./ui";
import { WebsiteBrand } from "./header";

export default function Footer({ locale, dictionary: d }) {
  return <footer className="bg-slate-950 pt-14 pb-6 text-slate-400"><Container><div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.2fr_1fr_1fr]"><div><Link href={pagePath(locale)}><WebsiteBrand dictionary={d} dark /></Link><p className="mt-6 max-w-sm text-sm leading-7">{d.common.footerText}</p></div><nav aria-label={d.nav.home} className="grid grid-cols-2 gap-x-4">{mainNavigation.map((page) => <Link key={page} href={pagePath(locale, page)} className="inline-flex min-h-11 items-center text-xs leading-6 hover:text-white">{d.nav[page]}</Link>)}</nav><div><h2 className="text-sm font-semibold text-white">{d.nav.contact}</h2><p className="mt-4 text-xs leading-7">{d.common.noContact}</p><Link href={pagePath(locale, "contact")} className="mt-4 inline-flex min-h-11 items-center text-xs font-semibold text-teal-300 hover:text-white">{d.common.enquiry} ↗</Link></div></div><div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[10px] leading-6"><span>© {new Intl.NumberFormat(locale === "ar" ? "ar-AE-u-nu-arab" : "en-AE", { useGrouping: false }).format(2026)} {d.common.copyright}</span><span className="max-w-xl">{d.common.futureNote}</span></div></Container></footer>;
}
