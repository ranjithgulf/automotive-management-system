> Historical audit before published webforms. The custom API files and activation guidance below are superseded by [the current cleanup audit](webform-cleanup-audit-2026-11-08.md) and [published forms](AutoFlow_GCC_Zoho_Webforms.md).

# AutoFlow GCC repository audit

Date: 5 November 2026. Baseline: ac3fa07. Scope: this AutoFlow checkout only. This initial audit was recorded before cleanup and feature development. Local environment values were never printed. Source/import and asset references, routes, package scripts, current tracked files, and 93 text blobs reachable through available Git refs were inspected. There were no broken local imports among the tracked source files.

## Initial feature audit

| Feature | Before development | Evidence | Required action |
| --- | --- | --- | --- |
| Homepage | Complete as a demonstration | src/components/website/home-page.js | Preserve automotive visual system; add customer request shortcuts |
| Navigation | Partial | header.js, footer.js, config/website.js | Expose new quotation/support flows without duplicating existing pages |
| Vehicle sales | Partial, illustrative inventory only | mock-data/website.js, vehicles.service.js | Preserve clearly labelled samples; obtain verified inventory before real offers |
| General/vehicle enquiry | Partial | forms/enquiry-form.js, enquiries.service.js | Preserve demo disclosure; strengthen validation, submission locking and transport contract |
| Test-drive request | Partial | vehicles/vehicle-enquiry.js | Preserve non-confirming demo; add a general entry point |
| Quotation enquiry | Missing | No form kind/CTA exists | Add a bilingual quotation form using existing contact route |
| Service request | Partial | /en/service-request/, Arabic equivalent | Preserve existing flow, improve handoff readiness |
| Customer support | Missing dedicated flow | Existing contact form and inactive chat only | Add bilingual support page/form and Desk boundary |
| English/Arabic | Complete for existing demo | dictionaries.js, locale layout | Extend matching keys and RTL for new content |
| SalesIQ | Partial, intentionally inactive | integrations/salesiq-widget.js | Preserve placeholder; require official domain-approved snippet |
| Zoho readiness | Partial | Demo-only services; no live endpoints | Prepare documented browser contract and fail-closed Pages Function/adapters |
| Cloudflare compatibility | Complete static frontend; account unverified | output: export, .node-version, Pages instructions | Keep npm run build / out / Node 24; add only approved Pages Function boundary |

## Cleanup inventory before changes

| File or folder | Issue identified | Evidence it is unused or unsafe | Action planned | Risk |
| --- | --- | --- | --- | --- |
| src/components/ui/brand.js | Duplicate legacy branding | No inbound import; header WebsiteBrand is used by header/footer | Remove after verification | Low |
| src/lib/format.js | Legacy formatting utilities | No import/re-export/runtime references; active cards own locale-aware formatting | Remove after verification | Low |
| public/file.svg, globe.svg, next.svg, vercel.svg, window.svg | Unused starter assets | No source, CSS, data, config, docs or route references; active icon is src/app/icon.svg | Remove after verification | Low |
| src/components/.gitkeep, src/services/.gitkeep, src/lib/db/.gitkeep | Redundant directory placeholders | Directories already contain tracked implementation files; no runtime references | Remove files only | Low |
| src/hooks/.gitkeep, src/app/api/.gitkeep | Empty obsolete scaffold | No hook or Next API implementation; no imports or route references | Remove placeholder files only | Low |
| src/components/ui/primitives.js unused exports | Old dashboard styles, Badge and Panel | Only Notice has inbound usage; new public UI uses website/ui.js | Retain Notice; remove unused exports | Low |
| src/app/globals.css mono token | References an unloaded font variable | No font-mono class/reference in app; no Geist Mono loader | Remove unused token | Low |
| .env.example DATABASE_URL | Nonempty placeholder connection string | Clearly fake USER/PASSWORD, not an exposed real secret; user requires empty placeholders | Replace value with empty assignment | Low |
| .gitignore | Missing Cloudflare/local-tool patterns | .dev.vars and .wrangler not ignored | Add patterns without excluding Pages Functions/source | Low |
| .env | Valid local environment, DATABASE_URL configured | Ignored, not tracked, no matching secret found in tracked/current or historical text | Retain untouched; never include value in report | High if disclosed |
| prisma/, prisma.config.mjs, scripts/db-check.mjs, src/lib/db/prisma.js, src/config/database.js | Dormant website DB foundation | Explicit db:* package scripts and internal DB imports still reference them | Retain; do not run DB operations or create business records | Review |
| @prisma/*, prisma, pg, dotenv dependencies | No live public website need | Database scripts/config still use them; pg is adapter peer/runtime foundation | Retain pending an explicit DB-tooling retirement decision | Review |
| .next/, out/, node_modules/ | Generated local output/cache | Correctly ignored; zero tracked generated files | Retain local artifacts needed for verification | Low |
| icon dictionary | Some entries may be legacy | Icons are selected dynamically from data; shared fallback exists | Retain uncertain entries | Low |
| tests/website.test.mjs, docs/, AGENTS.md | Supporting project files | Package script and project handoff/runtime conventions reference them | Retain | Low |

## Security findings before changes

- Found .env (ignored, server-only DATABASE_URL configured) and tracked .env.example (fake database connection placeholder and empty Zoho variables). No real .env, .env.local, .env.production or .dev.vars history was found in available refs.
- No tracked private-key files, generated outputs or ignored-sensitive files; no current NEXT_PUBLIC_ secret variables found. Current code reads database credentials through process.env and does not import the database into the website.
- Pattern and exact-local-secret scans found no confirmed live hardcoded secret in current tracked files or the 93 examined historical text blobs. This is a bounded audit of available local refs, not a guarantee about unfetched refs, remote logs or external systems.
- Historical src/services/mock-auth.js contains a hardcoded DEMO_PASSWORD. Historical src/lib/validation.js contains password validation text/fixtures. These files are absent from the current tree. Values are deliberately omitted. Treat any reuse of that demo password for a real account as compromised and rotate it. No history rewrite is performed.
- No personal/customer records were found in current source. Website data is labelled illustrative; automated tests use synthetic example contact details.
- Database and Zoho .env values must remain local/server-only. Existing local .env will not be edited or deleted. No credential rotation is attempted by this task.

## Deployment and integration boundaries

Keep static Next.js export and Node 24. No OpenNext dependency or invocation exists in this checkout. Cloudflare dashboard configuration is outside local files and remains to be verified. Pages Functions will fail closed without verified Zoho destinations/mappings; no CRM/Desk/Books call may be claimed as working. The brief provides https://gizoauto.com as the intended website; deployed domain ownership/canonical configuration is not independently verified, so SITE_URL remains configurable rather than hardcoded.

## Execution results

Cleanup and the credential-independent website work are complete. Default demo mode is retained. No private local environment file, database record, branch, Git history, remote deployment setting or production integration was altered.

| File or folder | Issue identified | Evidence it is unused or unsafe | Action taken | Risk |
| --- | --- | --- | --- | --- |
| src/components/ui/brand.js | Duplicate obsolete brand component | Zero inbound imports/re-exports; WebsiteBrand remains used in header/footer; build/browser checks pass | Removed | Low |
| src/lib/format.js | Dead formatting module | No imports/runtime references; vehicle-card owns the active locale-aware formatters | Removed | Low |
| public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg | Unused starter graphics | No asset references in source/data/styles/config/docs; active icon and five WebP assets retained | Removed all five | Low |
| src/components/.gitkeep, src/services/.gitkeep, src/lib/db/.gitkeep | Redundant placeholders | Populated directories already contain tracked implementation files | Removed only the three files | Low |
| src/hooks/.gitkeep, src/app/api/.gitkeep | Empty obsolete scaffold | No hooks or Next API implementation; integration is a root Pages Function | Removed only the two files | Low |
| src/components/ui/primitives.js | Unused dashboard exports/styles | Notice is the only imported export | Retained Notice; removed Badge, Panel and three unused style exports | Low |
| src/app/globals.css | Unused mono font token | No font-mono use and no corresponding loaded font | Removed token | Low |
| .env.example | Nonempty fake connection string | Fake USER/PASSWORD placeholder, not a real credential; all example assignments must be empty | Replaced with empty values and documented server/public ownership | Low |
| .gitignore | Cloudflare local-secret/cache gaps | .dev.vars and .wrangler were not covered | Added .dev.vars*, .wrangler/, .open-next/, browser test outputs and private-key extensions | Low |
| .next/static/generated build directory | Read-only OneDrive cache blocked rebuild | EPERM was confined to verified generated cache path | Removed that cache directory; rebuild succeeded | Low; generated only |
| .env | Contains valid local DATABASE_URL | Ignored and untracked; no matching URL/password found in current files/history/export/bundle | Retained untouched | Sensitive local configuration |
| DB tooling, Prisma/pg/dotenv dependencies | Dormant public-site usage | Explicit db:* scripts and internal diagnostic imports still use them | Intentionally retained; no DB commands run | Review before retiring |
| Icon dictionary, active WebP assets, docs and tests | Potential names alone do not establish dead code | Icons are data-selected; images/routes/tests and handoff references remain active | Retained | Low |
| .next/, out/, node_modules/, .wrangler/ | Local generated artifacts | Ignored; no tracked generated files found | Retained locally for verification; not committed | Low |

## Completed website work

- Added a reusable six-action customer request section on the homepage and enquiry pages, without duplicating existing contact/service routes.
- Added quotation requests (including a vehicle-specific CTA/dialog), generic vehicle/test-drive request entry points, and /en/customer-support/ plus /ar/customer-support/.
- Added matching English/Arabic support/quotation content, categories, labels, instructions and failure feedback. Existing dictionaries were reformatted for readability; keys remain in parity.
- Strengthened phone validation for GCC country-code lengths, Arabic/Persian digits and international formats. Shared validators also reject malformed types, invalid enum values, dates and overlong inputs.
- Added an immediate submission lock, one retry key for unchanged failed requests, accessible loading/validation states and retained form values after failure. Language switching preserves allowlisted request context.
- Added website-owned request/response contracts, same-origin bounded transport and safe handling of unavailable endpoints, timeouts, invalid responses and rate limits.
- Added an intentionally unconfigured Pages Function with shared validation, origin/method/content-type checks and a streamed 8 KiB body cap. Separate CRM/Desk adapters make no API calls. Service destination remains undecided.
- Added Pages static security/cache headers and a routes file limiting Function execution to /api/enquiries. The static output stays out; Node remains 24; no OpenNext or separate backend was introduced.
- Added eight focused integration/security tests to the existing ten tests. No application dependency was added, removed or upgraded; package-lock.json is unchanged. Temporary Playwright and Wrangler tooling were used outside the dependency manifest.

## Final security findings and Git safety

- Final exact-value re-scan: 59 current/new source text files, 94 historical text blobs, 247 exported text files, and the Wrangler-compiled Function. Neither DATABASE_URL nor its decoded password was found in those files. Pattern review found no confirmed live hardcoded secret in the current tree. Scans are bounded to local refs/files and cannot certify remote systems or inaccessible history.
- Environment files found: local .env (ignored/untracked, preserved), tracked .env.example (all assignments empty). No real environment file history was found in available refs. No private-key files or generated outputs are Git-tracked. No private credential uses NEXT_PUBLIC_; the new public variable is only a demo/live mode flag.
- Historical hardcoded DEMO_PASSWORD is confined to the removed mock-auth history; current app has no such authentication. No confirmed real committed credential was identified. Rotate/revoke that password if it was ever reused for a real account; no history rewriting or credential changes were performed.
- Full npm audit: eight moderate findings in the development lint chain rooted in minimatch; zero high/critical. Production-only audit: zero known findings. Do not feed untrusted patterns to development tooling; a compatible patched upstream dependency chain should be reviewed. npm proposed a major eslint-config-next downgrade; it was not applied automatically. Advisory: https://github.com/advisories/GHSA-g3hv-75wg-m249 .
- No customer records were collected. Browser checks used synthetic example.invalid contact details. No database/API writes, OAuth refresh, live widget, emails, payments, bookings or Zoho requests were performed.

## Verification actually executed

| Command or check | Actual result |
| --- | --- |
| npm run test:website | 18/18 passed, including server validation, all six kinds, unavailable Function, 400/403/404/429/500/503/malformed/network transport handling, safe messages and ignore rules |
| npm run lint | Passed |
| npm run build | Passed on final source: 42 static build entries; one read-only generated OneDrive cache was cleared after an EPERM retry |
| Wrangler 4.148.0 pages functions build functions --outdir temporary-directory --compatibility-date 2026-11-05 | Compiled successfully; no account/deployment operation |
| npm audit --json | Eight moderate development dependency findings; no high/critical |
| npm audit --omit=dev --json | Zero known production dependency findings |
| HTTP exported-site checks | 37/37 public routes returned 200 with correct lang/dir; four obsolete/invalid routes returned 404 |
| Chrome interaction checks | All six forms in both languages: required/email/phone validation, duplicate-click lock/loading, honest demo feedback, error state preserving entered data |
| Chrome navigation/catalog checks | Search, no-results/reset, filters/sort/load-more, galleries, all three vehicle request dialogs, mobile support menu, request-preserving locale switching passed |
| Responsive/visual checks | 50 combinations across 320, 375, 768, 1280, 1536 pixels; no horizontal overflow. English/Arabic support screens and request shortcuts visually inspected |
| Keyboard checks | Skip link focuses main; quotation dialog opens from keyboard, closes with Escape and restores focus |
| Browser asset/network checks | All homepage images decoded after scrolling; zero failed requests, uncaught errors or outgoing demo POSTs |
| git diff --check and final import/reference scan | Passed; no broken local imports; no generated/environment secrets tracked |

Browser screenshots are temporary review artifacts, not committed app files. Function behavior was executed through standard Request/Response tests and its bundle was compiled with Wrangler; no deployed Cloudflare runtime or real Zoho outage was claimed as tested.

## Remaining work / exact next handoff

Read zoho-integration-handoff.md for the feature-by-module table, field contracts, complete empty environment template and variable purposes. Obtain verified destinations, exact API field names/required values, regional OAuth endpoints/scopes, CRM validation/Blueprint/deduplication rules, Desk org/department/contact association rules, scheduling timezone/availability/approval details, official SalesIQ snippet/approved domains and an explicit Books scope decision. Store actual credentials only in local ignored files or Cloudflare secrets, not in the report/chat/browser variables.

Before activating live record creation: approve privacy/retention and translations, implement domain-verified server anti-abuse controls, distributed rate limiting and durable idempotency; replace the fail-closed adapters with the approved mappings and verify them in a sandbox. Frontend retry keys alone do not implement durable deduplication. No Books accounting logic or duplicate custom business database is built.

Verified business contact details, service scope, real vehicle stock/prices/photos and native Arabic editorial review remain pending. Existing sample listings are explicitly illustrative; no additional real stock, address, phone, certification, warranty, quotation, price or booking claim was invented. The brief names gizoauto.com, but its deployment could not be verified; SITE_URL stays configurable/unset. Cloudflare dashboard/Node/build/output/domain settings still require deployment-side verification. No production deployment was performed.

## File inventory for this change


Modified files:

- .env.example
- .gitignore
- README.md
- docs/website-rebuild.md
- package.json
- prisma/schema.prisma
- src/app/[locale]/[[...slug]]/page.js
- src/app/globals.css
- src/components/forms/enquiry-form.js
- src/components/ui/primitives.js
- src/components/vehicles/vehicle-enquiry.js
- src/components/website/content-pages.js
- src/components/website/header.js
- src/components/website/home-page.js
- src/config/website.js
- src/lib/website/dictionaries.js
- src/lib/website/forms.js
- src/services/website/enquiries.service.js
- tests/website.test.mjs

Created files:

- docs/repository-audit.md
- docs/zoho-integration-handoff.md
- functions/api/enquiries.js
- public/_headers
- public/_routes.json
- server/zoho/crm.js
- server/zoho/desk.js
- src/components/website/request-actions.js
- src/lib/website/enquiry-contract.js
- tests/integration.test.mjs

Removed files:

- public/file.svg
- public/globe.svg
- public/next.svg
- public/vercel.svg
- public/window.svg
- src/app/api/.gitkeep
- src/components/.gitkeep
- src/components/ui/brand.js
- src/hooks/.gitkeep
- src/lib/db/.gitkeep
- src/lib/format.js
- src/services/.gitkeep
