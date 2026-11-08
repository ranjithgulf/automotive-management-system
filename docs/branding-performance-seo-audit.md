# AutoFlow GCC - branding, performance and SEO audit

Date: 8 November 2026. Scope: existing AutoFlow GCC checkout only. No deployment, Git reset, dependency upgrade, remote organization change or live customer submission was performed. Earlier uncommitted changes were preserved. Gulf Infotech was untouched.

## Analysis and implementation plan

The existing bilingual English/Arabic site presents automotive sales/rental examples, service/workshop capabilities, spare parts and fleet/corporate journeys. Its audience includes GCC vehicle buyers, owners and fleet enquirers. Its existing message is a connected automotive journey. The visual direction therefore remains practical, professional and clear, with teal, navy, warm neutrals, Geist and Noto Sans Arabic. These are design conclusions from the visible site, not new business claims.

Reviewed the page/route structure, shared shell/header/footer, catalogue/gallery, form contracts and UI, metadata/robots/sitemap, assets/fonts, package tree, deployment headers, ignored environment setup, existing Zoho boundary and regression tests. There is no active authentication/dashboard/chart/editor/blog/location-page feature to optimize or invent. Database tooling remains referenced by db:* scripts and was retained.

Architecture remains Next.js 16.4.3 App Router with output: export, root Cloudflare Pages Functions, and the existing protected Zoho integration. There are 37 public URLs: root English alias plus 18 English and 18 Arabic pages, including eight illustrative vehicle details per language. The sitemap contains the 36 canonical localized URLs.

Sequence followed:
1. Inspect the existing source and measure the previous export.
2. Replace generic car-icon branding with a consistent vector identity.
3. Optimize actual photos and responsive delivery, preserving original backups.
4. Split the vehicle enquiry form, correct font preloads and measured accessibility issues.
5. Improve factual metadata, schema, breadcrumbs and origin safety.
6. Run production/regression/browser/security checks and repeat Lighthouse.

## Branding delivered

The geometric A/open-road mark and forward crossbar communicate AutoFlow and connection. The business name and existing tagline are unchanged.

See [brand-guidelines.md](brand-guidelines.md). All requested variants are in [public/assets/branding](../public/assets/branding): stacked primary, horizontal secondary, icon, light and dark surface variants, favicon, square social profile and branded social sharing card. SVG is the primary artwork; PNG/WebP profile exports and a PNG sharing card support uploads and previews.

Header and footer share src/components/website/brand.js. Browser favicon and 180px Apple touch icon were updated. Sharing metadata uses the 1200 x 630 branded card. Existing localized loading states were preserved; no unnecessary full-page loading screen was introduced.

Colors: mark teal #0f766e, navy #0f172a, dark-surface accent #5eead4, existing warm surface #fcfcf9. Website fonts remain Geist/Noto Sans Arabic with font-display: swap. SVG wordmark exports use a portable Arial/sans-serif fallback. No testimonials, certifications, addresses, telephone numbers, social accounts or live-stock claims were added.

## Images and asset delivery

| Item | Result |
| --- | --- |
| Original photos | 5, all already WebP; each 1536 x 1024 |
| JPG/JPEG/PNG photo conversions | 0 needed |
| Existing WebP photos recompressed | 5, quality 82 |
| Full-size photo bytes | 951,792 -> 874,768 |
| Full-size reduction | 77,024 bytes, 8.1% |
| New responsive derivatives | 20 at widths 320/480/768/1024 |
| New mobile hero crops | 2 at widths 480/640, existing 62% focal point preserved |
| Total photo files after optimization | 27 |
| Total photo-directory bytes | 1,869,422, including all responsive copies |

The total directory grows because multiple responsive versions are retained; the full-size originals shrink and individual browser requests are smaller. Do not interpret the full-size reduction as a reduction in the entire repository.

The mobile hero no longer stretches a landscape thumbnail into a tall frame. Native responsive srcset/picture delivery works on static Pages without a runtime image server. Meaningful images retain alt text, explicit dimensions and async decoding. The actual hero uses eager/high-priority loading; other images remain lazy. Gallery thumbnails use smaller size hints.

Original photos remain in the Git-ignored .asset-backups/2026-11-08 folder; they were not deleted. SVG branding was intentionally kept as vector. Apple/profile/sharing PNGs are deliberate compatibility exports. No original JPG/PNG photograph was found to convert.

Regenerate variants with node scripts/optimize-website-assets.mjs. It uses the original local backups where available, otherwise the checked-in full-size WebP files. The five known photo names and hero focal point are explicit, preventing blind conversion of unrelated assets.

## Performance changes and measured results

- Preserved Next.js route splitting and Server Components.
- Vehicle enquiry forms are dynamically imported and mounted when a dialog is opened. Existing localized form flows and focus restoration were verified.
- Removed next/image client machinery from the shared photo renderer in favor of explicit, generated static srcset assets.
- Extracted the shared brand component so the footer no longer imports it from the interactive header module.
- Stopped preloading the 166 KB Arabic face on English pages. Arabic still uses Noto Sans Arabic; its rendering was checked after the change.
- Preserved the original official SalesIQ URL, initialization and afterInteractive timing. A later-loading experiment did not initialize consistently and was reverted. The final widget was checked across English/Arabic documents and client navigation.
- Added conservative one-day caching with stale revalidation for images and branding in Cloudflare _headers. Hashed Next.js assets retain their existing immutable cache.
- No dependency was added, removed or upgraded. There are no heavy chart/editor packages or large live API lists requiring new virtualization/debounce/caching layers. The existing eight-item local catalogue filter remains immediate; existing OAuth caching and protected API behavior were preserved.

Lighthouse 13.6.0, default simulated mobile audit, local static preview at /en/, cold browser storage. Same audit categories/settings before and after. This preview does not reproduce Cloudflare edge compression/caching. Runtime third-party/network activity affects repeatability. Final values below are from the last recorded run, not the best intermediate score.

| Category | Before | Final |
| --- | --- | --- |
| Performance | 68 | 74 |
| Accessibility | 97 | 100 |
| Best practices | 77 | 77 |
| SEO | 100 | 100 |

| Metric | Before | Final | Interpretation |
| --- | --- | --- | --- |
| FCP | 1.54 s | 1.56 s | Meets the requested 1.8 s lab target; no claimed improvement |
| LCP | 7.69 s | 6.17 s | Improved, but does NOT meet 2.5 s |
| CLS | 0 | 0 | Meets 0.1 in this run |
| TBT | 329 ms | 204 ms | Lab blocking metric; NOT INP |
| Local document response | 36 ms | 5 ms | Localhost only; not production TTFB |
| INP | Not measured | Not measured | Requires suitable interaction/field measurement; no success claim |

All emitted JavaScript: 677,207 -> 667,677 raw bytes; individual-file gzip sum 213,944 -> 209,995 bytes. These sums cover all emitted chunks, not a visitor's one-route payload. The homepage first-party script transfer also fell by roughly 10 KB. Final font transfer was about 32 KB versus 199 KB before.

Intermediate performance scores varied from 61 to 74. The retained SalesIQ/vendor runtime and framework scripts still contribute requests, cookies and main-thread work. Production Core Web Vitals and a public PageSpeed Insights run for these changes are pending deployment; this audit does not claim field compliance or guaranteed scores. Further LCP/main-thread work should be measured on the deployed compressed site before making larger architecture changes.

Raw local evidence: %TEMP%/autoflow-lighthouse-before.json and %TEMP%/autoflow-lighthouse-release.json. A sanitized summary is saved as [audit-results-2026-11-08.json](audit-results-2026-11-08.json); raw vendor visitor telemetry is not copied into the repository.

## SEO and accessibility

- Unique localized page metadata, including distinct vehicle titles/descriptions that explicitly identify illustrative listings.
- Configurable canonical/hreflang URLs retained. Root / canonicalizes to /en/; sitemap excludes that duplicate.
- Public canonical origins require HTTPS; HTTP remains available for explicit loopback previews. Credentials, paths, query strings and fragments remain rejected.
- Explicit robots metadata, viewport/theme color, Open Graph and Twitter sharing metadata.
- Existing sitemap retained with 36 canonical entries, localized alternates and no fabricated lastmod.
- robots.txt allows public assets/pages, excludes /api/, and includes the configured sitemap.
- One clear main H1 per checked route. Vehicle card headings no longer skip directly from H1 to H3.
- Visible localized breadcrumbs and matching BreadcrumbList JSON-LD.
- One factual JSON-LD graph per page: Organization, WebSite, WebPage and BreadcrumbList where applicable. JSON syntax and references checked on exported pages. JSON is escaped against inline-script injection.
- Organization uses the high-resolution square brand asset. Product/Offer, ratings, LocalBusiness/address and FAQ rich-result claims were deliberately excluded because verified supporting business data is absent.
- Corrected measured light-surface contrast failures while retaining the existing palette/layout. Fixed the brand link accessible name to include its visible tagline.
- Keyboard form validation, native dialog focus restoration and reduced-motion support remain intact.

No URLs were renamed, no blog/location pages were fabricated, and no keyword tags or extra libraries were added. Internal links and all referenced image files were checked. Schema syntax checks are not a claim of Google rich-result eligibility.

References: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), [LCP measurement/optimization](https://web.dev/articles/optimize-lcp).

## Security, deployment and remaining configuration

- Local .env was preserved, remains ignored, and was not printed or changed. Empty .env.example placeholders remain intact.
- Export scan checked 246 text assets: no configured local secret values or verified internal Zoho IDs found.
- Existing nosniff, referrer and permissions headers retained. No broad/untested CSP was imposed that could break SalesIQ or Turnstile.
- npm audit --omit=dev: zero findings. Full npm audit: eight moderate findings in the ESLint/typescript-eslint/minimatch development chain. npm proposed a major eslint-config-next downgrade; no force fix was applied. Track [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) for a compatible toolchain update.
- No authentication feature is active, so no login success is claimed. All Zoho business-write tests remain mocked; OAuth/live record testing still needs owner credentials and the existing Phase B activation checklist.
- No dependency, lockfile or Next.js deployment-mode change was made. Cloudflare Pages remains Node 24, npm run build, output out, with root Pages Functions.
- Final local build used the handoff-verified SITE_URL=https://gizoauto.com as a command environment override. It was not hardcoded into configuration or saved to local secrets.

Manual owner actions:
1. Set the approved SITE_URL in Cloudflare build variables before publishing. Keep Node 24/static output settings and existing private Functions bindings/secrets.
2. Verify production HTTPS and preferred-host redirects in Cloudflare, including the intended handling of www and the Pages alias. These account/domain settings were not changed; do not redirect private previews blindly to production.
3. Verify the domain property in Google Search Console and submit https://gizoauto.com/sitemap.xml after deployment. Public PageSpeed Insights, deployed redirect/header checks and field INP/CWV verification remain pending.
4. Review production-only CSP/consent policies against the actual SalesIQ and published-form origins before enforcement. The former custom API activation guidance is superseded by [the current webform configuration](AutoFlow_GCC_Zoho_Webforms.md).
5. Review the compatible development-tool vulnerability fix. No live integrations, customer emails or account settings were enabled by this task.

## Verification and file inventory

| Check | Result |
| --- | --- |
| Existing/new regression tests | 70/70 pass |
| ESLint | Pass |
| Production static build | Pass; 43 build entries, including new Apple icon |
| Public routes | 37 checked; 36 distinct canonical URLs |
| Image references | All checked files exist; responsive picture assets additionally checked in browser |
| Internal route links | All 37 referenced paths resolve |
| Responsive layouts | 60 checks, widths 320/375/768/1280/1536; no overflow |
| Bilingual demo forms | 14/14 |
| Deferred vehicle dialogs | 6/6, Escape closes and returns focus |
| Catalogue search | English/Arabic checked |
| SEO export | Metadata, canonicals, one H1, JSON-LD, sitemap and robots checked |
| SalesIQ | One exact installation script; client navigation does not reinject; runtime/launcher checked |
| Arabic font/mobile hero | Correct font, responsive hero URL, no overflow |
| Browser diagnostics | No application page errors; final real-widget check also had no console errors |
| Production dependency audit | 0 findings |
| Git whitespace check | Pass |

Screenshots and route/form/widget results are in %TEMP%/autoflow-branding-review. Local site preview: http://127.0.0.1:4317. Normal static preview does not invoke production Pages Functions. No live chat message or Zoho customer record was sent.

Changes in this pass:
- New public/assets/branding exports; src/app/icon.svg and src/app/apple-icon.png.
- Five optimized public/images originals and 22 responsive derivatives.
- New brand.js, breadcrumbs.js and structured-data.js in src/components/website.
- Shared header/footer, photo UI, homepage, vehicle cards/content pages and document font layout.
- Vehicle gallery/list/enquiry components and form text contrast.
- src/lib/website/metadata.js, src/config/website.js, entry/localized page/layout metadata, and src/app/robots.js.
- public/_headers, .gitignore, scripts/optimize-website-assets.mjs and tests/website.test.mjs.
- Brand/audit documentation, sanitized results and README links.
- Existing sitemap, API/server modules, authentication state, dependencies and official SalesIQ installation behavior were intentionally preserved.
