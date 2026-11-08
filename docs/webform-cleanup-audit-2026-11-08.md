# AutoFlow GCC webform-era cleanup audit

8 November 2026. Scope: existing AutoFlow checkout only. No deployments, remote configuration, Zoho submissions, database operations, commits or history rewrites.

## Pre-cleanup evidence

Before deletion, inventoried all 135 non-generated project files, resolved local imports across 69 code/configuration files, checked routes, package scripts, environment variable names, documentation and public asset usage. No missing local imports. Existing uncommitted work was the five published-webform implementation files; it is preserved and extended only to remove its obsolete label dependency.

All seven visible forms use the published iframe renderer. The old API cluster has no current website caller: its remaining references are internal imports, exclusive tests and superseded documentation. Turnstile and Notice have no importers. The source Prisma helper and its configuration have no consumers; the separate db:* diagnostics use their own Prisma initialization. Reusing dictionary text preserves all seven headings and the reference label while removing unused custom-form copy.

## Decisions recorded before deletion

| File or folder | Issue identified | Evidence | Action | Risk |
| --- | --- | --- | --- | --- |
| functions/api/enquiries.js; server/zoho/ | Obsolete direct OAuth/CRM/Desk intake | No iframe component or active website import calls the endpoint; obsolete tests/internal cluster are the remaining consumers | Remove endpoint and all 11 server modules | Low locally; old deployed endpoint requires later deployment/removal review |
| workers/enquiry-guard/ source/config | Private guard only supported retired endpoint | Only old protection module/tests use it; not used by hosted forms | Remove local source/config; no remote Worker deletion | Remote resource remains until owner reviews it |
| public/_routes.json | Routed only /api/enquiries | No remaining Function after retirement | Remove; pure static Pages site needs no Functions routing file | Low; final deployment must include no stale Functions bundle |
| Old enquiry/appointment services, request contracts, validation, picklists and Turnstile | Unused custom/demo flow | References confined to retired cluster/tests | Remove together | Low |
| integration-labels.js and old form dictionary entries | Mostly obsolete custom field/error/demo strings | Only retained trade-in heading and reference are used by iframe UI | Move existing trade-in heading into dictionary, retain eight used keys per language, remove module/dead entries | Low |
| src/components/ui/primitives.js | Unused Notice component | No imports remain | Remove | Low |
| src/lib/db/prisma.js; src/config/database.js | Unused Next.js DB wrapper | No external importers; db-check initializes its own adapter | Remove wrappers only | Low |
| Exclusive API tests and obsolete API documentation | Test/document removed architecture | No surviving feature depends on them | Remove exclusive tests/docs; retain static deployment security checks | Low |
| pg direct dependency | No direct source/script import | Used transitively by @prisma/adapter-pg, which declares pg itself | Remove direct declaration with npm; retain transitive adapter dependency | Low |
| Prisma schema/config, db-check script, Prisma/dotenv packages and db:* scripts | Separate dormant diagnostic tooling | Explicit package scripts still invoke them | Retain; do not execute DB commands | Intentional retention |
| Published webform files, website pages, responsive images, fonts, SalesIQ, Cloudflare headers | Active site functionality | App imports, Next route conventions, dynamic image variants and metadata references | Retain | Required |
| Brand variants and original .asset-backups photos | External use/regeneration cannot be ruled out | Brand delivery files documented; optimizer explicitly reads original backups | Retain, including five ignored originals | Avoid losing source assets |
| .env | Contains valid retained DB and retired credentials | No confirmed credential backup; ignored, not Git-tracked | Keep file and private values; remove only unused blank/public configuration | Owner must decide credential retirement |
| Build outputs and empty Wrangler caches | Generated/local only | Ignored and not tracked; Wrangler directories contain zero files | Clear old out and cache folders, regenerate out with build | Low; .next dev state/node_modules retained |
| Previous repository/branding audit reports | Historical evidence | Security findings and image/performance provenance remain useful | Retain as historical evidence, update current links | Intentional retention |

### Exact deletion manifest

- functions/api/enquiries.js
- server/zoho/client.js
- server/zoho/crm.js
- server/zoho/desk.js
- server/zoho/errors.js
- server/zoho/mappings.js
- server/zoho/oauth.js
- server/zoho/protection.js
- server/zoho/service.js
- server/zoho/submit.js
- server/zoho/validation.js
- server/zoho/verified.js
- workers/enquiry-guard/worker.js
- workers/enquiry-guard/wrangler.jsonc
- src/components/forms/turnstile.js
- src/components/ui/primitives.js
- src/services/website/enquiries.service.js
- src/services/website/appointments.service.js
- src/lib/website/forms.js
- src/lib/website/verified-forms.js
- src/lib/website/zoho-choices.js
- src/lib/website/enquiry-contract.js
- src/lib/website/integration-labels.js
- src/config/database.js
- src/lib/db/prisma.js
- tests/zoho-phase-a.test.mjs
- tests/zoho-audit.test.mjs
- docs/zoho-phase-a.md
- docs/zoho-phase-b.md
- docs/zoho-integration-handoff.md
- docs/zoho-live-verification-2026-11-08.md
- docs/complete-form-zoho-audit-2026-11-08.md
- docs/complete-form-zoho-evidence-2026-11-08.json
- public/_routes.json

## Secret and environment review

Only .env and .env.example were found outside dependency/generated folders; no .env.local, .env.production or nested secret file was found. Before cleanup, current tracked files and index had zero matches for configured private values. Scanned 169 historical text objects: the configured Turnstile secret occurs in historical .env.example. It was formerly exposed as NEXT_PUBLIC_SECRET_KEY. No value is recorded here. Rotation/revocation still requires owner approval; deleting current source does not purge history. No staged changes existed and none will be staged automatically.

Current required template variables: SITE_URL (optional verified public build origin) and DATABASE_URL (retained db:* tooling only), both empty.

Local non-secret obsolete entries to remove: ZOHO_ACCOUNTS_URL, ZOHO_API_BASE_URL (both blank), NEXT_PUBLIC_TURNSTILE_SITE_KEY (public site key). Private retired entries to retain unchanged pending confirmed backup/owner retirement: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, TURNSTILE_SECRET_KEY. DATABASE_URL remains unchanged. No retained credential is used by the current frontend. No Cloudflare Production variables are read or changed.

## Verification

| Check | Result |
| --- | --- |
| npm run test:website | 13/13 relevant tests pass; exclusive retired API tests removed |
| npm run lint | Pass |
| npm run build | Pass; 43 static build entries and regenerated out |
| Static source graph | 42 code files; no missing imports or unreachable modules |
| Documentation links | No broken relative Markdown links |
| Exported routes/assets | 37/37 routes and 38 referenced assets return HTTP 200 locally; no missing files |
| Published forms and vehicle dialogs | 40/40 Chrome cases pass: seven page forms and three modal forms, EN/AR, 375px and 1280px |
| Browser diagnostics | No page errors, old API calls, POST attempts, popups or external parent navigation; no iframe/page overflow |
| Catalog/navigation | EN/AR search, clear, load more, Toyota filter (three actual matches), sort, mobile navigation (nine links), language switch and footer (11 links) pass |
| Export secret scan | 256 text assets; zero matches for configured private values |
| Static Pages architecture | No functions source, out/_routes.json or out/_worker.js; retained public/_headers |
| Package/lockfile review | Only direct pg declaration removed; adapter still uses pg 8.23.1; no unrelated version changes |
| git diff --check | Pass; normal Windows LF/CRLF notices only |
| Git safety | No staged changes, commits, pushes, branch changes or history rewrite |

The test count fell from 79 to 13 because 66 tests exclusively exercised the removed custom API/demo workflow. Existing catalog, localization, metadata and published-webform tests remain, with static deployment/environment safety tests adapted to the current architecture. Two temporary browser-check attempts needed locator/expected-count corrections; no application defect was found or source change made for those harness corrections.

No Next.js, Node.js, static-export or website styling/layout configuration changed. The existing Node module-type notices remain. Header, footer, catalog, SalesIQ and image/font source files are unchanged.

### Files intentionally retained

- Prisma schema/config, db-check and db:* scripts: explicit, separate local tooling; no DB operations executed.
- @prisma/client, @prisma/adapter-pg, prisma and dotenv: used by that tooling. pg remains transitively supplied by its adapter.
- Five original photos in .asset-backups: actively referenced by the image-regeneration script.
- Brand variants, historical image/performance and repository evidence: documented delivery/provenance uses; not assumed unused.
- node_modules and .next dev state: local installation/development artifacts; ignored, not blindly deleted. out and build cache were cleaned and regenerated.
- .env and its five remaining entries: DATABASE_URL plus four retired private credential entries. No private value changed or was removed.
- Seven published iframe configurations/renderers/tests and official SalesIQ widget: current active integrations.

No confirmed unused source modules remain under the audited entry points. Retained optional tooling/assets are intentional, not evidence of production website dependencies.


## Manual attention

- Existing deployed Worker/bindings/Production secrets are unchanged. Review their retirement separately; do not redeploy the removed Worker.
- Deploy the reviewed static export through the existing Pages project only when separately authorized. Confirm any old Function is absent after that deployment; local source removal does not remove a currently deployed endpoint.
- Keep credential values safely backed up before deleting them from local .env. Revoke obsolete OAuth authorization when approved, and rotate the historically exposed Turnstile secret.
- Zoho hosted forms remain English/LTR internally, including on Arabic pages; service/support are Leads webforms. Published scheduling/category fields and post-submit notifications are owned by Zoho and unchanged.
- Real Lead creation and success redirects remain untested; no submission is permitted during cleanup.
