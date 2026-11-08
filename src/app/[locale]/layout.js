import { notFound } from "next/navigation";
import { locales } from "@/config/website";
import { getDictionary } from "@/lib/website/dictionaries";
import DocumentLayout from "@/components/website/document-layout";
import WebsiteShell from "@/components/website/website-shell";

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export const dynamicParams = false;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }
export default async function LocaleLayout({ params, children }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  return <DocumentLayout locale={locale}><WebsiteShell locale={locale} dictionary={getDictionary(locale)}>{children}</WebsiteShell></DocumentLayout>;
}
