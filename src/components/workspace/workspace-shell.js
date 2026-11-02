"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Icon from "@/components/ui/icon";
import Dialog from "@/components/ui/dialog";
import { Badge, secondaryButton } from "@/components/ui/primitives";
import { navigation } from "@/config/navigation";
import { branches, notifications } from "@/lib/sample-data/dashboard";
import useDemoSession from "@/hooks/use-demo-session";
import { logoutDemo } from "@/services/mock-auth";

const WorkspaceContext = createContext(null);
export const useWorkspace = () => useContext(WorkspaceContext);

export default function WorkspaceShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, session } = useDemoSession();
  const [branch, setBranch] = useState("all");
  const [arabic, setArabic] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState("");
  const [read, setRead] = useState(false);
  const current = navigation.find((item) => pathname === `/${item.slug}`);
  const results = navigation.filter((item) => `${item.label} ${item.arabic}`.toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => { if (ready && !session) router.replace("/login"); }, [ready, session, router]);
  useEffect(() => {
    function close(event) { if (event.key === "Escape") { setPanel(null); setQuery(""); } }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (!ready || !session) return <main className="flex min-h-dvh items-center justify-center gap-3 bg-slate-50 text-sm text-slate-500" role="status"><span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 motion-reduce:animate-none" />Opening demo workspace…</main>;
  function signOut() { logoutDemo(); router.replace("/login"); }
  return <WorkspaceContext.Provider value={{ branch, setBranch, arabic, session }}><div dir={arabic ? "rtl" : "ltr"} lang={arabic ? "ar" : "en"} className="min-h-dvh bg-slate-50 text-slate-700">
    <a href="#main-content" className="fixed start-4 top-2 z-50 -translate-y-24 rounded-lg bg-teal-700 px-4 py-3 text-white focus:translate-y-0">Skip to content</a>
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 bg-slate-950 lg:block"><Sidebar arabic={arabic} /></aside>
    <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title="Navigation" drawer><div dir={arabic ? "rtl" : "ltr"} className="h-[calc(100dvh-5rem)]"><Sidebar arabic={arabic} onNavigate={() => setMobileOpen(false)} /></div></Dialog>
    <div className="min-w-0 lg:ms-64">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="flex min-h-18 flex-wrap items-center gap-3 px-4 py-3 sm:px-7 lg:px-8">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden"><Icon name="menu" /></button>
          <div className="hidden text-xs text-slate-400 xl:block">Workspace <span className="mx-2">/</span><span className="font-medium text-slate-700">{arabic ? current?.arabic : current?.label}</span></div>
          <div className="relative order-last w-full sm:order-none sm:ms-auto sm:w-auto sm:min-w-48 sm:flex-1 sm:max-w-sm"><Icon name="search" className="pointer-events-none absolute start-3 top-3 size-4 text-slate-400" /><input type="search" aria-label="Search modules" placeholder={arabic ? "البحث في الوحدات…" : "Search modules…"} value={query} onChange={(e) => { setQuery(e.target.value); setPanel(null); }} className="h-11 w-full min-w-0 rounded-lg border border-slate-200/60 bg-slate-50 ps-9 pe-3 text-base outline-none sm:text-xs focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10" />{query.trim() && <div className="absolute inset-x-0 top-full mt-2 max-h-[min(20rem,50dvh)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase">Module results</p>{results.length ? results.map((item) => <Link key={item.slug} href={`/${item.slug}`} onClick={() => setQuery("")} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-teal-50"><Icon name={item.icon} className="size-4 text-teal-600" /><span className="min-w-0"><span className="block">{arabic ? item.arabic : item.label}</span><span className="block text-[10px] text-slate-400">{item.group}</span></span></Link>) : <p className="p-3 text-sm text-slate-500">No modules found. Try “Sales” or “Workshop”.</p>}</div>}</div>
          <div className="ms-auto flex items-center gap-1 sm:ms-0 sm:gap-2"><button type="button" onClick={() => { setArabic(!arabic); setPanel(null); }} aria-label={arabic ? "Switch to English layout" : "Switch to Arabic layout"} className="flex h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium hover:bg-slate-50"><Icon name="globe" className="size-4" /><span>{arabic ? "English" : "العربية"}</span></button><span className="mx-1 h-6 w-px bg-slate-200" />
          <button type="button" aria-label="Notifications" aria-expanded={panel === "notifications"} onClick={() => { setPanel(panel === "notifications" ? null : "notifications"); setQuery(""); }} className="relative inline-flex size-11 items-center justify-center rounded-lg p-2.5 hover:bg-slate-50"><Icon name="bell" />{!read && <span className="absolute end-2 top-2 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" />}</button>
          <button type="button" aria-label="User profile" aria-expanded={panel === "profile"} onClick={() => { setPanel(panel === "profile" ? null : "profile"); setQuery(""); }} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50"><span className="flex size-9 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">AM</span><span className="hidden text-start md:block"><span className="block text-xs font-semibold text-slate-800">{session.name}</span><span className="block text-[10px] text-slate-400">Demo user</span></span><Icon name="chevron" className="hidden size-4 text-slate-400 md:block" /></button></div>
        </div>
        {panel && <><button type="button" aria-label="Close popup" className="fixed inset-0 z-20 cursor-default" onClick={() => setPanel(null)} /><div className="absolute end-4 top-full z-30 mt-2 max-h-[calc(100dvh-10rem)] w-[calc(100vw_-_2rem)] overflow-y-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:end-7">{panel === "notifications" ? <><div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3"><h2 className="text-sm font-semibold">Notifications <Badge tone="teal">{read ? "0 new" : "3 new"}</Badge></h2><button className="min-h-11 text-xs font-medium text-teal-700 hover:underline" onClick={() => setRead(true)}>Mark all read</button></div>{notifications.map((item) => <Link href={item.href} key={item.id} onClick={() => { setPanel(null); setRead(true); }} className="block rounded-xl p-3 hover:bg-slate-50"><p className="text-sm font-medium text-slate-800">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p></Link>)}<p className="px-3 py-2 text-[10px] text-slate-400">Sample notifications · current browser session</p></> : <><div className="border-b border-slate-100 p-3"><p className="text-sm font-semibold">{session.name}</p><p className="mt-1 truncate text-xs text-slate-500">{session.email}</p><p className="mt-2 text-[10px] text-amber-700">Demo session · no real permissions</p></div><Link href="/settings" onClick={() => setPanel(null)} className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-slate-50"><Icon name="settings" className="size-4" />Workspace settings</Link><button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-lg p-3 text-sm text-rose-600 hover:bg-rose-50"><Icon name="logout" className="size-4" />Sign out</button></>}</div></>}
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1680px] px-4 py-6 outline-none sm:px-7 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200/60 bg-teal-50/70 px-4 py-2.5 text-xs text-teal-800"><span className="flex items-center gap-2"><Icon name="lock" className="size-3.5" />{arabic ? "معاينة تجريبية · البيانات النموذجية باللغة الإنجليزية" : "Demo workspace · All figures and activity are sample data"}</span><span className="text-[10px] font-semibold tracking-wider uppercase">No live connections</span></div>
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">AUTOFLOW GCC / {arabic ? "نظرة عامة" : "OVERVIEW"}</p><h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">{arabic ? current?.arabic : current?.label}</h1><p className="mt-1.5 text-sm text-slate-500">{pathname === "/dashboard" ? arabic ? "نظرة شاملة على أداء أعمالك." : "Your business at a glance. Every branch, every opportunity." : "A dedicated workspace for the next phase of AutoFlow GCC."}</p></div><div className="flex flex-wrap items-center gap-2"><label className="relative flex min-w-0 flex-1 sm:min-w-44 items-center"><Icon name="pin" className="pointer-events-none absolute start-3 size-4 text-slate-400" /><span className="sr-only">Select branch</span><select value={branch} onChange={(e) => setBranch(e.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white ps-9 pe-3 text-base font-medium sm:text-xs outline-none focus:ring-2 focus:ring-teal-500"><option value="all">{arabic ? "جميع الفروع" : "All branches"}</option>{branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className={`${secondaryButton} text-xs`}><Icon name="clock" className="size-3.5" />Oct 2026</span></div></div>
        {children}<footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-[10px] text-slate-400"><span>© 2026 AutoFlow GCC · Automotive. Connected.</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-400" />Frontend prototype · AED reporting currency</span></footer>
      </main>
    </div>
  </div></WorkspaceContext.Provider>;
}
