export const locales = ["en", "ar"];
export const websitePages = ["about", "solutions", "vehicles", "services", "parts-accessories", "fleet-corporate", "contact", "service-request"];
export const mainNavigation = ["home", "about", "solutions", "vehicles", "services", "parts-accessories", "fleet-corporate", "contact"];
export const pagePath = (locale, page = "home") => `/${locale}${page === "home" ? "" : `/${page}`}/`;
export const localize = (value, locale = "en") => typeof value === "object" && value !== null ? value[locale] ?? value.en : value;
export function siteOrigin() {
  const candidate = process.env.SITE_URL;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    // Only an origin belongs in public metadata. Never accept credentials,
    // paths, query strings, or fragments from a mistaken environment value.
    if (!["https:", "http:"].includes(url.protocol)
      || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}
