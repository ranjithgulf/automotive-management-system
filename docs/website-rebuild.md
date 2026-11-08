# AutoFlow GCC structure and static deployment

Current after published-webform cleanup, 8 November 2026. See [cleanup evidence](webform-cleanup-audit-2026-11-08.md) and [published forms](AutoFlow_GCC_Zoho_Webforms.md).

## Structure

- src/app: static root, English/Arabic routes, metadata, icons, robots and sitemap.
- src/components/website and vehicles: existing layouts, navigation, catalog, gallery and enquiry dialogs.
- src/components/forms: enquiry selection and inline Zoho iframe rendering.
- src/config/zohoWebforms.ts: seven exact published URLs and presentation heights.
- src/services/website/vehicles.service.js: illustrative catalog projection and filtering.
- public: responsive images, brand assets and Cloudflare security/cache headers.
- tests: website/catalog/metadata, webform mapping and static deployment safety.

## Cloudflare Pages preparation

Keep the existing project, static export preset, build npm run build, output out and Node.js 24. No Next.js server, OpenNext adapter, custom OAuth backend, Pages Function or enquiry guard is required by the current site. public/_routes.json was removed because it only targeted the retired Function. Do not upload a stale _worker.js/Functions bundle.

Optional SITE_URL is a verified public HTTPS origin used at build time. Published forms and the public SalesIQ widget require no OAuth secrets in the frontend or build. Zoho handles the iframe's submissions. No Pages deployment or remote resource/settings removal is included in local cleanup.

After a separately approved deployment, verify the custom domain, seven inline forms, SalesIQ, sitemap, headers and absence of the retired API. Remove/revoke obsolete remote secrets/bindings/Worker only after owner approval and checking other consumers.

## Local diagnostic tools

Prisma schema/config and scripts/db-check.mjs remain referenced by db:* package scripts. DATABASE_URL belongs only in ignored local configuration. These tools are not the website backend and were not executed during cleanup.
