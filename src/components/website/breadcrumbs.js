import Link from "next/link";
import { pagePath } from "@/config/website";
import { getDictionary } from "@/lib/website/dictionaries";
import { Container } from "./ui";
export default function Breadcrumbs({ locale, page, vehicle }) {
  if (page === "home") return null;
  const d = getDictionary(locale);
  return <Container><nav aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} className="py-4 text-xs leading-6 text-slate-600"><ol className="flex flex-wrap gap-x-2"><li><Link className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-teal-700" href={pagePath(locale)}>{d.nav.home}</Link></li>{vehicle && <li><span aria-hidden="true" className="me-2">/</span><Link className="underline-offset-4 hover:underline" href={pagePath(locale, "vehicles")}>{d.nav.vehicles}</Link></li>}<li aria-current="page"><span aria-hidden="true" className="me-2">/</span>{vehicle ? <bdi dir="ltr">{vehicle.brand} {vehicle.model}</bdi> : d.nav[page]}</li></ol></nav></Container>;
}
