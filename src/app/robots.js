import { siteOrigin } from "@/config/website";
export const dynamic = "force-static";
export default function robots() {
  const origin = siteOrigin();
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}) };
}
