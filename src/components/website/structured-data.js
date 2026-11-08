import { pagePath, siteOrigin } from "@/config/website";
import { websiteMetadata } from "@/lib/website/metadata";
import { getDictionary } from "@/lib/website/dictionaries";

export default function StructuredData({ locale, page = "home", vehicle }) {
  const origin = siteOrigin();
  if (!origin) return null;
  const d = getDictionary(locale), meta = websiteMetadata(locale, page, vehicle);
  const url = meta.alternates.canonical, route = vehicle ? "vehicles/" + vehicle.id : page;
  const graph = [
    { "@type": "Organization", "@id": origin + "/#organization", name: "AutoFlow GCC", url: origin, logo: origin + "/assets/branding/social-profile.svg" },
    { "@type": "WebSite", "@id": origin + "/#website", name: "AutoFlow GCC", url: origin, inLanguage: ["en", "ar"], publisher: { "@id": origin + "/#organization" } },
    { "@type": "WebPage", "@id": url + "#page", url, name: meta.title, description: meta.description, inLanguage: locale, isPartOf: { "@id": origin + "/#website" } },
  ];
  if (page !== "home") {
    const items = [{ name: d.nav.home, item: origin + pagePath(locale) }];
    if (vehicle) items.push({ name: d.nav.vehicles, item: origin + pagePath(locale, "vehicles") });
    items.push({ name: vehicle ? vehicle.brand + " " + vehicle.model : d.nav[page], item: origin + pagePath(locale, route) });
    graph.push({ "@type": "BreadcrumbList", "@id": url + "#breadcrumb", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) });
    graph[2].breadcrumb = { "@id": url + "#breadcrumb" };
  }
  // No Product/Offer/LocalBusiness claims for illustrative inventory or missing contact details.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />;
}
