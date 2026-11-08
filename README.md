# AutoFlow GCC

English/Arabic automotive showcase built with Next.js static export, React and Tailwind CSS. Vehicle listings and photography are illustrative. Seven published Zoho CRM webforms render inside the existing website pages and vehicle dialogs. The official SalesIQ widget remains globally integrated.

## Run and verify

Use Node.js 24 and npm:

```sh
npm install
npm run dev
npm run test:website
npm run lint
npm run build
npm start
```

The build creates out/. npm start previews static files only. Open /en/ or /ar/.

## Enquiries

See [published URLs, locations and limitations](docs/AutoFlow_GCC_Zoho_Webforms.md). All seven are CRM Leads forms, including service/support. The old OAuth/CRM/Desk API, demo/live transport, Turnstile and enquiry-guard source have been retired locally. The website no longer sends enquiry data through /api/enquiries.

Website headings and navigation remain bilingual; hosted labels currently remain English/LTR. Zoho owns the published fields and submission behavior. No successful real record creation or post-submit notification behavior is claimed. Do not submit customer or test records without approval.

## Cloudflare Pages

Keep the existing project, static export preset, build command npm run build, output out and Node.js 24. Keep output: "export". No OpenNext adapter or Pages Function is required by the current website. Do not upload a stale Functions bundle.

Optional SITE_URL controls canonical URLs, sharing assets and sitemap at build time. Use the approved public HTTPS origin without credentials, paths, query strings or fragments. DATABASE_URL is for retained local db:* diagnostics only. Both template values are empty.

No OAuth or Turnstile secret is needed by the website. Ignored local credentials remain pending owner backup/retirement approval. Existing remote Functions, guard Worker, bindings and Production secrets are unchanged and require separate owner review.

## Retained tooling and assets

The db:* scripts, Prisma schema/config and database packages remain explicit local tools. They are not invoked by the website, build or tests; no database command was run during cleanup.

Responsive photo regeneration uses scripts/optimize-website-assets.mjs and the ignored .asset-backups originals. Brand variants remain for documented external uses.

## Documentation

- [Current cleanup audit and verification](docs/webform-cleanup-audit-2026-11-08.md)
- [Published webforms](docs/AutoFlow_GCC_Zoho_Webforms.md)
- [Current structure and deployment guide](docs/website-rebuild.md)
- [Brand guidelines](docs/brand-guidelines.md)
- [Historical branding/performance audit](docs/branding-performance-seo-audit.md)
- [Image provenance](docs/visual-assets.md)
- [Historical repository audit](docs/repository-audit.md)

The Turnstile secret previously committed to Git history still requires owner-approved rotation/revocation. Current cleanup does not purge history. No deployment, commit, remote configuration change or credential rotation is performed automatically.
