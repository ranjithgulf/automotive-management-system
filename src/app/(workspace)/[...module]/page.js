import Link from "next/link";
import { notFound } from "next/navigation";
import { navigation } from "@/config/navigation";
import Icon from "@/components/ui/icon";
import { Badge, primaryButton } from "@/components/ui/primitives";

export function generateStaticParams() {
  return navigation.filter((item) => item.slug !== "dashboard").map((item) => ({ module: item.slug.split("/") }));
}

export const metadata = { title: "Workspace | AutoFlow GCC" };
// The demo gate waits for browser storage before mounting workspace content.
export const instant = false;

export default async function ModulePage({ params }) {
  const { module } = await params;
  const item = navigation.find((entry) => entry.slug === module.join("/") && entry.slug !== "dashboard");
  if (!item) notFound();
  return <section className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Icon name={item.icon} className="size-8" /></span><Badge tone="teal">Planned module</Badge><h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{item.label}, on the road ahead.</h2><p className="mt-3 max-w-md text-sm leading-7 text-slate-500">This workspace is reserved for {item.label.toLowerCase()}. We’ll build its frontend first, add database functionality next, and connect Zoho when access is ready.</p><Link href="/dashboard" className={`${primaryButton} mt-7`}>Back to Dashboard <Icon name="arrow" className="size-4 rtl:rotate-180" /></Link><p className="mt-5 text-xs text-slate-400">No business actions or live data are available here yet.</p></section>;
}
