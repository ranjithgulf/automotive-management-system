import { getDictionary } from "./dictionaries.js";
import { pagePath, siteOrigin } from "../../config/website.js";

export function websiteMetadata(locale, page = "home", vehicle) {
  const d = getDictionary(locale);
  const title = vehicle ? `${vehicle.brand} ${vehicle.model} | AutoFlow GCC` : `${page === "home" ? "AutoFlow GCC" : d.nav[page]}${page === "home" ? ` | ${d.common.brandTagline}` : " | AutoFlow GCC"}`;
  const description = page === "home" ? d.home.description : d.pages[page]?.description || d.pages.vehicles.description;
  const origin = siteOrigin();
  const route = vehicle ? `vehicles/${vehicle.id}` : page;
  return {
    title, description,
    ...(origin ? { metadataBase: new URL(origin), alternates: { canonical: origin + pagePath(locale, route), languages: { en: origin + pagePath("en", route), ar: origin + pagePath("ar", route) } } } : {}),
    openGraph: { title, description, type: "website", siteName: "AutoFlow GCC", locale: locale === "ar" ? "ar_AE" : "en_AE", alternateLocale: locale === "ar" ? "en_AE" : "ar_AE", ...(origin ? { url: origin + pagePath(locale, route), images: [{ url: `${origin}/images/hero.webp`, width: 1536, height: 1024, alt: d.common.photoAlt }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(origin ? { images: [`${origin}/images/hero.webp`] } : {}) },
  };
}
