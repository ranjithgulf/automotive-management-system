"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationGroups } from "@/config/navigation";
import Brand from "@/components/ui/brand";
import Icon from "@/components/ui/icon";

const activeClass = "bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-500/15";
const inactiveClass = "text-slate-400 hover:bg-white/5 hover:text-white";

function NavigationGroup({ group, pathname, arabic, onNavigate }) {
  const active = group.children.some((item) => pathname === `/${item.slug}`) || pathname === `/${group.slug}`;
  const [expanded, setExpanded] = useState(active);
  const panelId = useId();
  const label = arabic ? group.arabic : group.label;

  if (group.id === "overview") {
    const item = group.children[0];
    return <div className="mb-4"><p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase">{label}</p><Link href={`/${item.slug}`} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${active ? activeClass : inactiveClass}`}><Icon name={group.icon} className="size-[18px] shrink-0" /><span>{arabic ? item.arabic : item.label}</span>{active && <span className="ms-auto size-1.5 rounded-full bg-teal-400" />}</Link></div>;
  }

  return <div>
    <div className={`flex min-h-11 items-center rounded-lg ${active ? "bg-white/5 text-teal-300" : inactiveClass}`}>
      {group.slug ? <Link href={`/${group.slug}`} onClick={onNavigate} aria-current={pathname === `/${group.slug}` ? "page" : undefined} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-teal-400"><Icon name={group.icon} className="size-[18px] shrink-0" /><span>{label}</span></Link> : <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(!expanded)} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-start text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-teal-400"><Icon name={group.icon} className="size-[18px] shrink-0" /><span>{label}</span></button>}
      <button type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${group.label} navigation`} aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded(!expanded)} className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-teal-400"><Icon name="chevron" className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} /></button>
    </div>
    <div id={panelId} hidden={!expanded} className="ms-5 mt-1 mb-2 border-s border-white/10 ps-3"><ul className="space-y-0.5">{group.children.map((item) => {
      const selected = pathname === `/${item.slug}`;
      return <li key={item.slug}><Link href={`/${item.slug}`} onClick={onNavigate} aria-current={selected ? "page" : undefined} className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-xs leading-5 transition focus-visible:outline-2 focus-visible:outline-teal-400 ${selected ? activeClass : inactiveClass}`}>{arabic ? item.arabic : item.label}</Link></li>;
    })}</ul></div>
  </div>;
}

export default function Sidebar({ arabic, onNavigate = () => {} }) {
  const pathname = usePathname();
  return <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 px-6 py-7"><Link href="/dashboard" onClick={onNavigate} aria-label="AutoFlow GCC dashboard"><Brand dark /></Link></div>
    <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-5">{navigationGroups.map((group) => <NavigationGroup key={`${pathname}:${group.id}`} group={group} pathname={pathname} arabic={arabic} onNavigate={onNavigate} />)}</nav>
    <div className="m-4 shrink-0 rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-200"><span className="size-2 rounded-full bg-amber-400" />Demo workspace</div><p className="mt-2 text-[11px] leading-5 text-slate-500">Sample data. No live business operations.</p></div>
  </div>;
}
