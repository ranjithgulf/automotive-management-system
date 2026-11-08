import { getDictionary } from "./dictionaries.js";
import { pagePath, siteOrigin } from "../../config/website.js";

export function websiteMetadata(locale, page = "home", vehicle) {
  const d = getDictionary(locale);
  const title = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year}) | ${d.nav.vehicles} | AutoFlow GCC` : `${page === "home" ? "AutoFlow GCC" : d.nav[page]}${page === "home" ? ` | ${d.common.brandTagline}` : " | AutoFlow GCC"}`;
  const description = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year}). ${d.common.sample}. ${d.pages.vehicles.detailsText}`.slice(0, 160) : page === "home" ? d.home.description : d.pages[page]?.description || d.pages.vehicles.description;
  const origin = siteOrigin();
  const route = vehicle ? `vehicles/${vehicle.id}` : page;
  return {
    title, description, robots: { index: true, follow: true },
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
    ...(origin ? { metadataBase: new URL(origin), alternates: { canonical: origin + pagePath(locale, route), languages: { en: origin + pagePath("en", route), ar: origin + pagePath("ar", route) } } } : {}),
    openGraph: { title, description, type: "website", siteName: "AutoFlow GCC", locale: locale === "ar" ? "ar_AE" : "en_AE", alternateLocale: locale === "ar" ? "en_AE" : "ar_AE", ...(origin ? { url: origin + pagePath(locale, route), images: [{ url: `${origin}/assets/branding/social-card.png`, width: 1200, height: 630, alt: "AutoFlow GCC — " + d.common.brandTagline }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(origin ? { images: [`${origin}/assets/branding/social-card.png`] } : {}) },
  };
}
