"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/ui/icon";
import Dialog from "@/components/ui/dialog";
import { mainNavigation, pagePath } from "@/config/website";
import { Container, buttonPrimary } from "./ui";
import WebsiteBrand from "./brand";

export default function Header({ locale, dictionary: d }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const otherLocale = locale === "en" ? "ar" : "en";
  const currentParts = pathname.split("/").filter(Boolean);
  const slug = ["en", "ar"].includes(currentParts[0]) ? currentParts.slice(1).join("/") : "";
  const switchHref = `/${otherLocale}/${slug ? `${slug}/` : ""}`;
  const activePage = slug.split("/")[0] || "home";
  function switchLanguage(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const current = new URLSearchParams(window.location.search);
    const query = new URLSearchParams();
    for (const key of ["request", "type", "service", "reference"]) {
      const value = current.get(key);
      if (value) query.set(key, value.slice(0, 200));
    }
    router.push(switchHref + (query.size ? "?" + query.toString() : ""));
  }
  function links(mobile = false) { return mainNavigation.map((page) => <Link key={page} href={pagePath(locale, page)} onClick={() => setOpen(false)} aria-current={activePage === page ? "page" : undefined} className={mobile ? `flex min-h-12 items-center rounded-lg px-4 text-sm ${activePage === page ? "bg-teal-500/15 text-teal-300" : "text-slate-300 hover:bg-white/5"}` : `inline-flex min-h-11 items-center whitespace-nowrap text-xs font-medium transition ${activePage === page ? "text-teal-700" : "text-slate-600 hover:text-teal-700"}`}>{d.nav[page]}</Link>); }
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md"><Container className="flex h-20 min-w-0 items-center justify-between gap-3"><Link href={pagePath(locale)} aria-label={"AutoFlow GCC — " + d.common.brandTagline}><WebsiteBrand dictionary={d} /></Link><nav aria-label={d.common.menu} className="hidden items-center gap-5 2xl:flex">{links()}</nav><div className="flex shrink-0 items-center gap-2 sm:gap-4"><Link href={switchHref} onClick={switchLanguage} hrefLang={otherLocale} lang={otherLocale} aria-label={d.common.language} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs font-medium text-slate-700 hover:bg-slate-100">{d.common.language}</Link><span className="hidden md:block"><Link href={pagePath(locale, "contact")} className={`${buttonPrimary} px-5 text-xs`}>{d.common.enquiry}</Link></span><button type="button" aria-label={d.common.menu} aria-expanded={open} onClick={() => setOpen(true)} className="flex size-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 xl:hidden"><Icon name="menu" /></button></div></Container><nav aria-label={d.nav.home} className="hidden items-center justify-center gap-6 border-t border-slate-100 px-5 py-1 xl:flex 2xl:hidden">{links()}</nav>
    <Dialog open={open} onClose={() => setOpen(false)} title="AutoFlow GCC" closeLabel={d.common.close} drawer><div className="flex max-h-[calc(100dvh-6rem)] flex-col overflow-y-auto px-3 pb-6"><nav aria-label={d.common.menu} className="space-y-1">{links(true)}</nav><Link className={`${buttonPrimary} mt-6`} href={pagePath(locale, "contact")} onClick={() => setOpen(false)}>{d.common.enquiry}</Link></div></Dialog>
  </header>;
}
