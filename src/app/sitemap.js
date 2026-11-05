import { locales, websitePages, pagePath, siteOrigin } from "@/config/website";
import { getVehicles } from "@/services/website/vehicles.service";
export const dynamic = "force-static";
export default async function sitemap() {
  const origin = siteOrigin();
  if (!origin) return [];
  const pages = ["home", ...websitePages, ...(await getVehicles()).map((v) => `vehicles/${v.id}`)];
  return locales.flatMap((locale) => pages.map((page) => ({ url: origin + pagePath(locale, page), alternates: { languages: Object.fromEntries(locales.map((language) => [language, origin + pagePath(language, page)])) } })));
}
