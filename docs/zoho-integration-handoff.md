# AutoFlow GCC integration handoff

> Current readiness: [Phase B](zoho-phase-b.md) implements the round-2 assignment rule, direct service, AutoFlow Desk fields and bilingual protected forms. Earlier notes below are historical.

> Update, 6 November 2026: the verified handoff has now been implemented for Phase A. See [zoho-phase-a.md](zoho-phase-a.md) for exact IDs/mappings, protected version-2 submissions and remaining activation requirements. The original readiness notes below describe the earlier unconfigured baseline.

This document describes website-owned fields, not Zoho API field names. The frontend stays a Next.js static export on Cloudflare Pages. Business records belong in Zoho; the dormant local Prisma tooling is not an application backend.

## Readiness

| Website feature | Proposed Zoho destination | Status | Required verified details | Next action |
| --- | --- | --- | --- | --- |
| General and vehicle enquiry | CRM Lead or confirmed sales destination | Ready request/UI contract; waiting for Zoho details | Destination module, required fields, exact field API names/types, owner/routing, deduplication criteria, validation/Blueprint constraints | Approve mapping and test sandbox creation |
| Test-drive request | CRM plus approved scheduling process | Waiting for Zoho details and booking decision | Vehicle/source ID, timezone, operating hours, availability API, approval flow, final confirmation rules | Keep preferred date/time as an enquiry until confirmed |
| Quotation request | CRM or approved sales process | Ready form; waiting for business decision | Whether CRM or Books issues quotations, required customer/vehicle/service fields, approval and document workflow | No price/tax/discount generation in website |
| Service request | CRM or Desk, not decided | Waiting for business decision | Responsible app, department/workshop, service types, timezone, approval and scheduling workflow | Select destination before enabling adapter |
| Customer support | Desk | Ready request/UI contract; waiting for Zoho details | Region, organization and department, contact lookup/create association rules, ticket fields/categories, owner/routing, attachments/retention policy | Implement sandbox ticket creation only after handoff |
| SalesIQ | Official SalesIQ widget | Waiting for Zoho details | Official snippet/widget code, approved gizoauto.com/Pages hostnames, region, supported languages, consent policy | Existing placeholder stays inactive; no guessed script |
| Books, payments, invoices | Not confirmed for this website phase | Not required for current implementation | Explicit scope and approval first | No accounting logic, duplicated records or payment URLs |

## Request/response contract

The browser adapter is src/services/website/enquiries.service.js. It never imports server/zoho or private variables. Default demo mode sends nothing. NEXT_PUBLIC_ENQUIRY_MODE=live enables only a same-origin POST attempt; it does not activate Zoho.

POST /api/enquiries accepts JSON:

- version: 1.
- idempotencyKey: opaque retry key; retained across a failed retry with unchanged form values.
- kind: contact, vehicle, drive, quotation, service or support.
- locale: en or ar.
- vehicleReference: optional website display reference; illustrative references must not be treated as verified Zoho inventory IDs.
- values: an allowlisted object matching that kind's formFields() schema.
- All form values are strings. Server code rejects unknown fields, invalid types, invalid choices/dates, invalid email/phone formats, overlong values and oversized payloads.

Fields:

| Kind | Fields in addition to name/email/phone/message |
| --- | --- |
| contact | company (optional), type |
| vehicle | interest, method |
| drive | interest, method, date, time |
| quotation | interest |
| service | brand, model, registration (optional), branch, service, date, time |
| support | category, subject |

The website choice IDs are UI concepts only. Do not send them as Zoho picklist values without a verified mapping.

The function at functions/api/enquiries.js has exact same-origin checks, POST/JSON restrictions, an 8 KiB streamed-body cap and shared server validation. It always fails closed with HTTP 503 / integration_unconfigured / delivered=false / confirmed=false. CRM and Desk adapter files contain no guessed endpoints, module IDs, tokens or field mappings. Service routing remains undecided. No personal data or technical provider response is logged. This is scaffolding, not a working Zoho integration.

The browser recognizes network failure/timeouts, malformed success responses, 429 and unavailable responses. It shows localized safe messages and retains entered details on failure. It only reports delivery after an explicit successful response with ok=true and delivered=true. It never equates enquiry receipt with confirmed availability.

## Before activating live submissions

1. Obtain a verified Zoho handoff and decide the destinations above. Confirm that illustrative inventory is replaced by approved public inventory or reviewed build-time content.
2. Review lawful processing/retention and approve privacy text/consent. Do not collect attachments until storage, malware checks, size limits and retention are approved.
3. Configure server-only credentials in Cloudflare Pages secrets; limit OAuth scopes to approved operations and domains. Confirm the region before configuring account/API URLs.
4. Implement token refresh and the exact reviewed mappings in server/zoho. Enforce Zoho validation rules and Blueprints rather than bypassing them.
5. Add verified server-side anti-abuse controls (for example domain/action-checked Turnstile token verification), distributed rate limiting and durable idempotency/deduplication before any record-creation path is enabled. The current retry key alone is NOT durable deduplication. Do not add a custom database of Zoho business records.
6. Make provider requests bounded by timeouts. Map validation, permission, expired token, rate-limit and network failures into safe error codes. Never log tokens, request bodies or unnecessary customer details. Do not retry record creation blindly.
7. Test duplicate clicks/retries, 429 handling, expired credentials, partial failures, region errors, contact association, Blueprint rules and provider downtime against an approved sandbox.
8. Enable NEXT_PUBLIC_ENQUIRY_MODE=live only after the handler and privacy/anti-abuse gates are approved and verified. Rebuild the static site when public build variables change.

## Environment variables

Every assignment in .env.example is empty. Local .env remains ignored and unchanged. Cloudflare Functions read secret bindings from context.env, not a browser bundle.

| Variable | Purpose | Required when | Configure at | Server-only / browser exposure |
| --- | --- | --- | --- | --- |
| DATABASE_URL | Retained local db:* diagnostics only | Only when intentionally running database diagnostics | Ignored local .env | Private; never browser |
| SITE_URL | Canonical/hreflang/sitemap public origin | When the actual deployed origin is verified | Pages build environment | Public origin; no credentials/path/query |
| NEXT_PUBLIC_ENQUIRY_MODE | demo (default) or live transport attempt | Optional, after approved integration | Pages build environment | Public non-secret flag |
| ZOHO_CLIENT_ID | OAuth application identity | Future approved integration | Pages server environment | Keep server-only |
| ZOHO_CLIENT_SECRET | OAuth application secret | Future approved integration | Pages secrets | Private; never browser |
| ZOHO_REFRESH_TOKEN | Approved account refresh token | Future approved integration | Pages secrets | Private; never browser |
| ZOHO_ACCOUNTS_URL | Verified regional OAuth accounts origin | Future approved integration | Pages server environment | Keep server-only; do not guess region |
| ZOHO_API_BASE_URL | Verified regional API origin | Future approved integration | Pages server environment | Keep server-only; do not guess region |
| ZOHO_DESK_ORG_ID | Verified Desk organization | If Desk is activated | Pages server environment | Keep server-only |
| ZOHO_DESK_DEPARTMENT_ID | Verified Desk destination department | If Desk requires that department | Pages server environment | Keep server-only |

CRM organization IDs, Books organization IDs, field names and widget values are deliberately not fabricated or prefilled. Further bindings should be added only for the approved design.

## Cloudflare deployment

Use Pages, static export preset, npm run build, out, Node 24. public/_routes.json limits Function execution to /api/enquiries. The root functions/ source is compiled/deployed separately by Pages Git integration; it is not a Next.js POST Route Handler and does not require OpenNext. For direct upload, use a Functions-aware Pages deployment flow; uploading only out as raw static files does not provide the API. npm start serves static files only and intentionally cannot run Pages Functions.

The brief names https://gizoauto.com as the intended website. Keep SITE_URL configurable; set it only to the verified deployed origin. No DNS, account, remote environment, hosting or production integration changes were performed.

Official references: [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/), [Pages bindings/secrets](https://developers.cloudflare.com/pages/functions/bindings/), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Final environment template

```env
# Local diagnostic tooling only; never used by the website.
DATABASE_URL=

# Public build configuration. Blank enquiry mode defaults to demo.
SITE_URL=
NEXT_PUBLIC_ENQUIRY_MODE=

# Reserved for the verified server-only Zoho handoff; no live calls yet.
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ACCOUNTS_URL=
ZOHO_API_BASE_URL=
ZOHO_DESK_ORG_ID=
ZOHO_DESK_DEPARTMENT_ID=
```
