import Link from "next/link";
import Icon from "@/components/ui/icon";
import { pagePath } from "@/config/website";
import { Arrow, Container, SectionHeading } from "./ui";

export default function RequestActions({ locale, dictionary: d, compact = false }) {
  const actions = [
    ["contact", "mail", pagePath(locale, "contact")],
    ["vehicle", "car", pagePath(locale, "contact") + "?request=vehicle"],
    ["drive", "car", pagePath(locale, "contact") + "?request=drive"],
    ["quotation", "file", pagePath(locale, "contact") + "?request=quotation"],
    ["trade-in", "car", pagePath(locale, "contact") + "?request=trade-in"],
    ["service", "tool", pagePath(locale, "service-request")],
    ["support", "support", pagePath(locale, "customer-support")],
  ];
  const content = <div className={"grid gap-3 " + (compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>{actions.map(([kind, icon, href]) => <Link key={kind} href={href} className="group flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 transition hover:border-teal-600 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600"><Icon name={icon} className="size-5 shrink-0 text-teal-700" /><span>{d.requests[kind]}</span><Arrow className="ms-auto size-4" /></Link>)}</div>;
  return compact ? <nav aria-label={d.requests.title}>{content}</nav> : <section className="border-b border-slate-200 py-14 sm:py-20"><Container><SectionHeading eyebrow={d.requests.eyebrow} title={d.requests.title} text={d.requests.description} />{content}</Container></section>;
}
