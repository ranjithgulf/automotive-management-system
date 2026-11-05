# AutoFlow GCC public website rebuild

## Scope

AutoFlow GCC now has a public showcase website. Zoho One remains the intended operational platform. The website does not manage CRM records, workshop jobs, inventory, finance, HR, approvals, or user administration.

Removed: internal Login/Create Account/Forgot Password pages, Dashboard, sidebar/workspace layout, all Sales management screens, Sales operational API handlers, mock business workflows, internal navigation configuration, demo-auth storage, and their obsolete tests/documentation. Shared UI icons, dialog, and useful styling were retained. The PostgreSQL/Prisma configuration and ignored `.env` were deliberately preserved; the website neither imports the database client nor writes to the database. No schema or database changes were made.

## Completed public experience

Both `/en/` and `/ar/` provide Home, About, Automotive Solutions, Vehicles, Services, Parts & Accessories, Fleet & Corporate, Contact, and Service Request pages. Eight vehicle detail pages are generated per language. `/` renders the English homepage. Old internal URLs return 404.

- Home: automotive hero, introduction, illustrative featured vehicles, service capabilities, planned Zoho One operations, value propositions and enquiry CTAs.
- About: solution vision and automotive focus; no invented company history, endorsements, awards or certifications.
- Solutions: all ten requested verticals, descriptions, capabilities, benefits and enquiry links.
- Vehicles: search, brand/price/condition/type filters, sorting, empty states and load-more. Detail pages provide galleries, specifications, sample prices/availability, vehicle and test-drive enquiry forms, and related vehicles.
- Services: nine service categories, benefits and preselected service-request links.
- Parts: four illustrative product categories, compatibility-to-be-confirmed text and enquiry references. No purchasing or inventory operations.
- Fleet: corporate maintenance, schedules, account/contract/service-history capabilities and business enquiry.
- Contact: no fabricated email, phone, address or hours. Unverified details are clearly marked, and no location map is invented.
- Forms: labelled fields, client validation, loading, explicit mock success, selectable demonstration error state, and no outgoing submission requests. Appointment/test-drive completion never claims a confirmed booking.
- SalesIQ: a reusable inactive component, without guessed scripts, credentials or a custom chatbot backend.

## Language/content implementation

`src/lib/website/dictionaries.js` owns English/Arabic navigation, page copy, labels, errors and feedback. `src/lib/mock-data/website.js` owns bilingual service/solution/product descriptions and canonical vehicle projections. Both dictionaries have matching keys.

Locale root layouts emit the correct server-rendered `html lang` and `dir`. Language switching preserves the current page and vehicle ID. Arabic uses Noto Sans Arabic, logical Tailwind spacing and locale-aware currency/numbers. Vehicle names, references, and other technical identifiers use LTR isolation where appropriate. The content remains editable. Native Arabic editorial review is required before publication, especially if real prices, offers, warranty terms or legal text are introduced; this demonstration creates no legal terms or binding offers.

## Data and integration boundaries

```text
Public components
  -> services/website/vehicles.service.js
  -> illustrative public vehicle projections

Enquiry forms
  -> services/website/enquiries.service.js / appointments.service.js
  -> explicit demo result (delivered=false, confirmed=false, stored=false)

Future approved integration
  -> validated secure server endpoint / approved build-time data source
  -> confirmed Zoho application and field mappings
```

Components do not call Zoho. There are no live Zoho reads, OAuth flows, widget scripts, emails, appointments, payments or business-record writes. Mock submissions use no fetch, browser storage, database, or external messaging. The catalog is a small selected public projection, not a permanent inventory database. Images and availability labels are illustrative and do not claim verified inventory.

The mock adapter can be replaced inside the service boundary after credentials, source modules, field API names, region, scopes, consent, validation, rate limits, anti-abuse controls and business configuration are confirmed. Static Pages cannot execute a Next.js POST Route Handler; live submission needs a separately approved secure server runtime/endpoint or an approved hosting change. That decision does not require rewriting form components. Secrets must never be put in browser code or `NEXT_PUBLIC_` variables.

## Files and retained configuration

Created:

- `src/app/(entry)/`: English root homepage/layout.
- `src/app/[locale]/`: localized layouts, generated public routes and localized not-found component.
- `src/app/robots.js`, `sitemap.js`, `icon.svg`.
- `src/components/website/`: document/site layouts, header, footer, presentation pages, public UI and vehicle cards.
- `src/components/vehicles/`: filtered listing, gallery and enquiry dialogs.
- `src/components/forms/enquiry-form.js`.
- `src/components/integrations/salesiq-widget.js`.
- `src/config/website.js`, `src/lib/website/`, `src/lib/mock-data/website.js`.
- `src/services/website/`: vehicle, enquiry and appointment service modules.
- `public/images/`: five optimized generated WebP assets.
- `scripts/serve-website.mjs`: local static preview only, not an application backend.
- `tests/website.test.mjs` and this documentation.

Modified: Next.js configuration for static export, package scripts, shared Dialog close localization, `.env.example` (optional public `SITE_URL` only), and README. Shared styling, ESLint, npm, JavaScript, Next.js, React and Tailwind remain in use. No new dependencies were installed. Database packages/configuration remain dormant and are not part of the website bundle or operational architecture.

Image prompts, tools and final asset paths are recorded in [visual-assets.md](visual-assets.md). Images were generated with the built-in image tool and optimized as WebP using the already-installed Sharp dependency.

## Local commands

```sh
npm install
npm run dev
# http://localhost:3000, /en/, /ar/
npm run lint
npm run test:website
npm run build
npm start
# Serves out/ at http://localhost:3000 after building.
```

If the dev server already uses port 3000, stop it or set `PORT` before starting the static preview. The preview accepts only GET/HEAD and serves files from the generated `out/` directory. On Windows, it also resolves Next.js 16.4.3's nested RSC segment filenames to the dot-separated URLs requested by the browser. This is a local preview compatibility fallback; Cloudflare's Linux build emits the flat filenames directly.

## Cloudflare Pages preparation

The existing Next.js project uses `output: export`, trailing-slash routes, and precompressed local WebP images. Cache Components/partial prefetching were removed because this public static site has no operational server requirements. Default runtime image optimization is disabled for static hosting; the image files themselves are optimized. Tailwind’s existing loader remains configured.

Configure **Cloudflare Pages**, using its **Next.js (Static HTML Export)** preset:

| Setting | Value |
| --- | --- |
| Root directory | The directory containing this checkout's `package.json` (repository root for this repository) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node.js | `24`, pinned by the root `.node-version` file |

Remove any dashboard build-command override that invokes `opennextjs-cloudflare`, `@opennextjs/cloudflare`, or `@cloudflare/next-on-pages`. Do not run `wrangler deploy` / Workers automatic framework configuration for this static Pages site. If the existing application is a Workers project, create/use a Pages project connected to the correct repository and branch; changing local files does not convert that remote project type. No OpenNext adapter, Worker entry point, standalone output, or runtime database binding is needed. There is no OpenNext setup in this checkout to uninstall.

The Pages Git build command is a dashboard setting, not a Next.js or Wrangler `build` setting. The repository already defines `npm run build` as `next build` and `output: "export"` produces `out`. Configure production and preview build settings consistently. Remove a conflicting `NODE_VERSION` dashboard override, or set it to `24` so it agrees with `.node-version`. No account, hosting, DNS, domain, SSL or integration changes were performed.

Set `SITE_URL` to the **verified public origin** before the production build. This supplies canonical/hreflang URLs, absolute Open Graph image URLs, and sitemap entries. The custom domain is not confirmed. Leave `SITE_URL` blank for the first deployment; after Cloudflare provides the actual Pages URL, set that verified HTTPS origin as the Pages build variable and rebuild. Do not infer the URL from the repository name or automatically use branch-preview URLs. Replace it with a custom domain only after that domain is confirmed. Preview builds can leave it blank, or explicitly use the verified production origin when that is the intended canonical target. Values containing credentials, non-HTTP(S) schemes, paths other than `/`, query strings or fragments are rejected. Without a valid supplied origin, no domain is invented: canonical URLs/absolute social-image URLs are omitted and the sitemap has no entries. `robots.txt` is generated. The English root homepage canonicalizes to `/en/` when the origin is configured.

Official deployment reference: [Cloudflare Pages static Next.js export](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/). Static export behavior: [Next.js documentation](https://nextjs.org/docs/app/guides/static-exports).

## Before publication

Confirm company information, actual services, contact details, locations, business hours, vehicle/product specifications, prices and genuine availability. Review Arabic and commercial copy. Set the verified site origin. Configure and verify the selected Zoho sources/workflows and official SalesIQ widget before enabling any live interaction. No mock success message should be changed to “sent” or “confirmed” without backend verification.

## Completed verification

Static Pages preparation rechecked on 5 November 2026 using Node 24.22.1 and Next.js 16.4.3: production export passed (40 build entries), all 10 website tests and ESLint passed, and all 35 public URLs returned HTTP 200 with the correct language/direction. Chrome checks of English/Arabic navigation, locale preservation, catalog search/filtering/load-more, galleries, form validation/demo success/error, and mobile menus/dialogs passed after the Windows preview filename fix. No failed browser requests, uncaught errors, or outgoing form POSTs remained. A scan of 234 exported text assets found none of the configured private database/Zoho credential values. `SITE_URL` was intentionally unset; no canonical origin was invented and the sitemap had no URL entries. Cloudflare dashboard settings and the actual Pages origin still require configuration at deployment.

- ESLint and the static production build pass.
- Ten automated tests cover dictionary parity, locale routes, catalog filters/sorting, editorial scope, local image references, validation, Arabic phone digits, mock submission behavior, safe SEO metadata, and removal of internal routes.
- All 34 localized public routes returned HTTP 200 with the correct HTML language; old Login, Dashboard, Sales, API and Settings routes returned 404.
- Main pages were checked in both languages at 320, 768, 1024, 1280, and 1536 pixels against the real document client width, with no page overflow.
- Vehicle/test-drive dialogs, navigation drawers and the SalesIQ placeholder were checked at 320, 375, 768 and 1280 pixels in both languages. Rapid dialog switching also passed.
- Browser checks covered search, empty results, load-more, galleries, preserved-route language switching, localized validation, loading/error/success, service and test-drive enquiries, and the inactive chat state. No uncaught exceptions or outgoing form POST requests were observed.
- All homepage images loaded, and both language screenshots were visually reviewed.
- The existing development server returned HTTP 200 for the new homepage. The generated static output was also served and tested independently.
- The existing database connection value was checked against text assets in the export; no occurrence was found. Database/schema/configuration files remained unchanged.
