# AutoFlow GCC

Bilingual public automotive showcase website built with Next.js App Router, JavaScript, React and Tailwind CSS. Zoho One is the planned operational business platform. This website does not recreate its CRM, workshop, inventory, finance, HR or administration functionality.

## Run

Use Node.js 24 LTS and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000, /en/, or /ar/.

```sh
npm run lint
npm run test:website
npm run build
npm start
```

The build creates out/ for Cloudflare Pages. npm start serves that static output locally. Forms are clearly labelled demonstrations: no messages, appointments or customer data are sent or stored. Vehicle listings, product information and photographs are illustrative. Zoho and SalesIQ are not connected.

## Customer request flows

General enquiries, vehicle enquiries, test-drive requests, quotation requests, service requests and customer support are available in English and Arabic. Quotation and generic vehicle/test-drive flows reuse the contact route; customer support has its own localized page. Forms remain clearly labelled demonstrations by default. The Cloudflare Pages Function deliberately returns an unconfigured response until the Zoho handoff, privacy review and anti-abuse/deduplication gates are complete. Phase B wires the bilingual forms to protected version-2 submissions, including trade-in. Credentials and activation remain pending; no live Zoho integration is claimed. See the Phase B guide before enabling intake.

## Documentation

- [Phase B readiness and exact owner activation steps](docs/zoho-phase-b.md)
- [Phase A Zoho services, verified mappings and activation requirements](docs/zoho-phase-a.md)
- [Repository audit, cleanup evidence, security findings and final verification](docs/repository-audit.md)
- [Zoho integration contract, environment ownership and exact handoff requirements](docs/zoho-integration-handoff.md)
- [Rebuild report, file structure, data boundaries and deployment setup](docs/website-rebuild.md)
- [Generated image assets and original prompts](docs/visual-assets.md)

Cloudflare Pages settings: **Next.js (Static HTML Export)** preset, build command **`npm run build`**, output directory **`out`**, Node.js **24** (pinned in `.node-version`). Replace any OpenNext build override in Cloudflare; this checkout does not use an adapter or standalone server. See the [deployment setup](docs/website-rebuild.md#cloudflare-pages-preparation) for the exact settings and Workers/Pages distinction.

The round-2 handoff verifies gizoauto.com and automotive-management-system.pages.dev. Set the optional `SITE_URL` build variable to the approved HTTPS origin for the deployment and rebuild so canonical URLs, social images and sitemap entries use it. Do not include credentials, paths, query strings or fragments. No company history, contact information, verified availability, integrations or domain details are invented.

The existing ignored .env and dormant PostgreSQL/Prisma foundation were retained. No database tables or business records are created by this website. Real Zoho submission requires confirmed configuration and an approved secure server endpoint.

## Branding, image delivery and SEO audit

See [the completed audit and measured limitations](docs/branding-performance-seo-audit.md), [brand assets and usage](docs/brand-guidelines.md), and [sanitized before/after results](docs/audit-results-2026-11-08.json). Original photo backups are retained locally in the ignored .asset-backups directory.

## Complete form and live-integration audit

See [the latest form/Zoho audit](docs/complete-form-zoho-audit-2026-11-08.md) and [sanitized evidence](docs/complete-form-zoho-evidence-2026-11-08.json). Live record creation is NOT TESTED; business approvals and Preview access remain pending. The exposed Turnstile secret requires owner rotation.
