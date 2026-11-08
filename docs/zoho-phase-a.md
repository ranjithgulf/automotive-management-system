# AutoFlow GCC: Phase A implementation

> Historical Phase A baseline. [Phase B](zoho-phase-b.md) now supersedes pending assignment, Desk custom fields, service default and legacy UI statements below. See that guide for current activation steps.

Date: 6 November 2026. Status: server-side implementation with mocked verification; NOT a verified live Zoho integration.

## Source and scope

The complete 547-line user-supplied ZOHO_INTEGRATION_HANDOFF.md was reviewed at:
C:/Users/HELLO MENTOR/Downloads/ZOHO_INTEGRATION_HANDOFF.md

Source SHA-256: 286fcea9ad51010b5528fa886cd59e38da175834147b5ffbaa57780e290625df

86 endpoint/ID/picklist values in server/zoho/verified.js were cross-checked against that source; no unmatched values were found. The appointment time list is derived from the verified 07:00-17:00 half-hour range. Source instructions to create users/clients, change organization settings, configure SalesIQ or generate credentials are ADMIN HANDOFF STEPS, not actions executed by this implementation. No organization settings, layouts, fields, workflows, assignments or other demos were modified.

The website was not rebuilt or redesigned. Its existing uncommitted cleanup/UI work was preserved. Legacy version-1 demo forms still receive an unconfigured response if pointed at live intake; missing names, model/brand, condition, branch or consent are never guessed from a full name or illustrative vehicle reference. Existing demos remain the default.

## Implemented modules

| File | Responsibility |
| --- | --- |
| server/zoho/verified.js | Verified US hosts, allowed AutoFlow IDs and exact stored English picklists |
| server/zoho/oauth.js | Server-only refresh-token exchange, single-flight isolate cache, expiry skew, optional private KV cache and invalidation |
| server/zoho/client.js | Allowlisted CRM/Desk endpoints, final layout/field fences, OAuth retry, bounded backoff and sanitized failures |
| server/zoho/validation.js | Strict version-2 schema; names, E.164 phone, lengths, dates, exact picklists, consent and context allowlist |
| server/zoho/mappings.js | Lead, Contact, Requested appointment and Desk payload builders |
| server/zoho/crm.js | Insert-only AutoFlow Leads; no Lead search/upsert by email/mobile |
| server/zoho/service.js | Explicitly selected Lead or Contact-search/create + appointment flow |
| server/zoho/desk.js | Explicitly selected Lead or Desk ticket flow |
| server/zoho/protection.js | Activation preflight, origin approval, Turnstile verification and private guard calls |
| server/zoho/submit.js | Protected submission orchestration and safe public receipt |
| functions/api/enquiries.js | Existing Pages endpoint; method/origin/JSON/body limits, legacy compatibility and safe errors |
| workers/enquiry-guard/ | Private service Worker + Durable Object for rate/retry security metadata |
| src/lib/website/enquiry-contract.js | Added createVerifiedSubmission alongside the unchanged legacy contract |
| src/services/website/enquiries.service.js | Added submitVerifiedEnquiry alongside existing demo transport |
| tests/zoho-phase-a.test.mjs | Phase A mock/network-failure/security tests; no real Zoho calls |

No dependency was added, removed or upgraded. The package lock, static export configuration, routing and website layouts were not changed by Phase A.

## Verified destinations and fields

| Website request | Destination | Required safeguards |
| --- | --- | --- |
| vehicle / contact | Leads; layout 5413253000014418033 | First_Name, Last_Name, Mobile, Interested_Brand, Interested_Model, New_or_Used, Preferred_Branch, Next_Follow_up_Date; Website Enquiry / New Enquiry; trigger workflow |
| quotation | Same Leads layout | Description starts [Quotation request]; optional trade-in/payment fields. NEVER writes Quotes |
| drive | Same Leads layout | Description starts [Test drive request], records requested Dubai date/time and explicit licence self-attestation. NEVER writes Test_Drives |
| trade-in | Same Leads layout | Has_Trade_In=true, provided Trade_In_Details, [Trade-in request] description |
| service, appointment mode | Contacts Standard 5413253000000091033, then Service_Appointments layout 5413253000014444017 | Search email, then phone; reuse only one unambiguous match, otherwise create Contact. Contact uses Primary_Contact_First_Name, NOT First_Name. Appointment_Status=Requested |
| service, lead mode | Leads AutoFlow layout | Interested_Model=Service booking; still requires explicit brand/condition/branch |
| support, desk mode | Desk org 785172113, department 759804000005916029 | Open / Web / Medium; inline contact, no assignee/due date or automotive category invented |
| support, lead mode | Leads AutoFlow layout | [Complaint] description plus all mandatory Lead fields; only after business approval |

Desk ticket layout 759804000005918977 is verified as the department default. The code selects that department and does not invent an unsupported layout API parameter. No CRM Contact ID is reused as a Desk contact ID.

The final API client independently rejects unrelated modules, foreign layouts, staff fields, visitor tracking fields, Contacts lease/rent fields, Desk cf_* fields, approval/blueprint triggers and broad Contacts reads. It cannot create/update Deals, Quotes, Test_Drives or organization configuration. There is no lar_id or Owner override because no verified assignment rule/user ID was supplied.

Each genuinely distinct Lead submission inserts a Lead, even when its email/mobile matches another enquiry. HTTP retry protection applies only to the same opaque idempotency key; it does not replace or bypass the verified duplicate-note workflow.

Budget is an optional caller-provided NUMBER IN OMR. The server leaves Currency empty for the org default. It does not convert illustrative AED prices, calculate quotations/tax, or invent stock/price data.

## Version-2 submission contract

Use createVerifiedSubmission and submitVerifiedEnquiry for the future verified forms. POST /api/enquiries accepts a strict JSON envelope:

- version: 2.
- idempotencyKey: stable opaque request key, 8-80 letters/digits/hyphens. Keep it for retries of the same intent.
- kind: contact, vehicle, quotation, drive, trade-in, service or support.
- locale: en or ar; maps to English or Arabic in CRM.
- vehicleReference: optional display reference only; never becomes a CRM lookup ID.
- values: website-owned keys below, not raw Zoho API keys.
- turnstileToken: real token from the configured widget, maximum 2048 characters.
- consent: true only after the user explicitly accepted the approved wording.
- consentVersion: must equal the approved server-side version.
- context: optional same-origin pageUrl, utmSource, utmMedium, utmCampaign. Arbitrary query strings/fragments are removed from the recorded URL.

Common values: firstName (40), lastName (80), mobile (30, international), message (2000); optional email (100), company (200).
Lead values: brand, model, condition, branch. These must contain exact English picklist values from verified.js; no default Other/branch/condition is fabricated.
Optional Lead values: bodyType, timeline, paymentMethod, budget, contactMethod, customerType, hasTradeIn, tradeInDetails.
Drive values: preferredDate, preferredTime, licenceConfirmed=true.
Trade-in values: tradeInDetails required; kind itself sets Has_Trade_In=true.
Service values: branch, serviceType, preferredDate, preferredTime (verified half-hour picklist); optional brand/model/registration. Lead fallback additionally needs brand and condition.
Support values: subject; Lead fallback additionally needs all mandatory Lead values.

Unknown keys, invalid types, staff IDs and unapproved picklist labels are rejected. Arabic display labels must be mapped to the verified English stored values in the future UI; pending Arabic picklist translations are not invented.

A successful public response is only:
{"ok":true,"delivered":true,"confirmed":false}

This means Zoho accepted a record. It does NOT mean an email was sent, an appointment/test drive was confirmed, or a quotation was issued. No internal record/contact/ticket IDs or ticket number are returned. Public references await business approval.

Safe failure codes include invalid, provider_validation, challenge_failed, rateLimited, integration_unconfigured, in_progress, idempotency_conflict, result_unknown and unavailable. Provider messages, tokens and full request bodies are never logged or returned. Only curated provider codes/API field names and status can enter server diagnostics.

## OAuth and retry behavior

- Only server code reads context.env OAuth secrets. The public API cannot exchange an authorization grant or create an OAuth client/user.
- Refresh POST bodies use form encoding, fixed verified accounts origin, no redirects, and bounded timeouts.
- Cache access tokens in isolate memory with a 60-second expiry margin and one in-flight refresh. Optional ZOHO_TOKEN_CACHE stores only short-lived access tokens, not client secrets or refresh tokens, under a hashed cache key.
- Use the validated api_domain from the token response as the CRM host. Only the verified US origin is allowed; a token/domain from another data centre fails closed. Desk uses its separately verified US API base.
- A rejected token is invalidated and refreshed once. A failed KV delete cannot resurrect the rejected token.
- OAuth/GET transient errors and definite 429 throttles use bounded backoff. A 400 validation rejection is not retried.
- IMPORTANT SAFETY QUALIFICATION to the handoff's general 5xx retry advice: a POST network/5xx/malformed-success failure may have created a record already. It is marked result_unknown rather than blindly repeated. Reconcile in Zoho before trying a new key.
- A Contact created before an ambiguous appointment failure is not recreated by retrying that same guarded submission.
- New verified browser transport uses a 30-second timeout. A client timeout never authorizes an automatic create retry with a fresh key.

## Cloudflare protection and infrastructure

Pages Functions still run separately from the static Next.js out directory. No OpenNext, Next.js server adapter or separate custom business backend is required. public/_routes.json continues to route only /api/enquiries to Functions.

Before any Zoho API call:
1. Validate the JSON schema and same-origin request.
2. Check an explicitly approved HTTPS origin and feature/destination flags.
3. Check credentials, fixed verified IDs, approved consent text/version and the business working-day calendar where a Lead is needed.
4. Atomically claim the request through the private ENQUIRY_GUARD service.
5. Validate Turnstile success, hostname and configured action on the server.
6. Call only the allowlisted AutoFlow operation.

workers/enquiry-guard/wrangler.jsonc is a PROPOSED deployment configuration, not an existing remote resource ID. It bundles a private Worker with public workers.dev and preview URLs disabled, plus an EnquiryGuard Durable Object. Nothing has been deployed.

The guard requires the same encrypted ENQUIRY_GUARD_SECRET (at least 32 characters) on the Pages Function and guard Worker. Pages needs an ENQUIRY_GUARD service binding to that Worker; the Worker binds STATE to its Durable Object class through its configuration. Do not configure resource bindings as plain string variables.

The guard rate-limits five attempts per ten minutes per HMAC-hashed Cloudflare client IP. Atomic request claims prevent concurrent copies from creating multiple records. Completed requests return a safe cached receipt. Changed payloads with the same key return conflict. Ambiguous creates retain a blocked outcome.

Stored guard data is limited to opaque request/claim keys, keyed HMACs, counters, status and expiry; it is pseudonymous security metadata, NOT a duplicate Zoho customer/business database. It contains no raw IPs, names, contact details, messages or Zoho records. Retention is 24 hours, with alarm cleanup. Approve that security-metadata retention and expected capacity before production. The idempotency guarantee is bounded to this retention window; do not blindly resubmit unresolved writes after expiry. Use separate Preview/Production clients and bindings where practical.

## Environment and decisions

All .env.example assignments remain empty. The valid local .env was preserved untouched.

| Setting | Value / requirement |
| --- | --- |
| ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN | PENDING administrator-created OAuth client and grants; encrypted server secrets only |
| ZOHO_ACCOUNTS_URL | Optional strict override: https://accounts.zoho.com |
| ZOHO_API_DOMAIN | Optional strict override: https://www.zohoapis.com; token response remains authoritative |
| ZOHO_CRM_LEADS_LAYOUT_ID | Optional strict override: 5413253000014418033 |
| ZOHO_CRM_SERVICE_APPOINTMENTS_LAYOUT_ID | Optional strict override: 5413253000014444017 |
| ZOHO_DESK_API_BASE | Optional strict override: https://desk.zoho.com/api/v1 |
| ZOHO_DESK_ORG_ID | Optional strict override: 785172113 |
| ZOHO_DESK_DEPARTMENT_ID | Optional strict override: 759804000005916029 |
| ZOHO_ENABLE_CRM_LEADS | Blank/disabled by default; true only after approvals and staging testing |
| ZOHO_SERVICE_MODE | Blank/disabled, lead or appointment; business decision still PENDING |
| ZOHO_SUPPORT_MODE | Blank/disabled, lead or desk; routing/scopes decision still PENDING |
| ZOHO_WORKING_WEEKDAYS | REQUIRED for Lead creation: approved CSV weekday numbers (0=Sunday through 6=Saturday). No working week inferred from country/timezone |
| ZOHO_HOLIDAYS | Optional approved CSV YYYY-MM-DD exclusions |
| TURNSTILE_SECRET_KEY | PENDING encrypted server secret for the approved widget |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | PENDING public widget key; not a private credential |
| ENQUIRY_ALLOWED_ORIGINS | Explicit verified HTTPS origins, comma-separated; no path/trailing slash/guessed Pages URL |
| ENQUIRY_TURNSTILE_ACTION | Explicit widget action that the server requires |
| ENQUIRY_CONSENT_VERSION / ENQUIRY_CONSENT_TEXT | Approved policy version and exact wording; no default legal text invented |
| ENQUIRY_GUARD_SECRET | Encrypted private service secret, shared only between Pages and guard |
| ENQUIRY_GUARD | REQUIRED private Cloudflare service binding |
| ZOHO_TOKEN_CACHE | OPTIONAL private KV binding for access-token caching |
| SITE_URL | Public build-time canonical origin, still independently configurable |
| NEXT_PUBLIC_ENQUIRY_MODE | Keep blank/demo until actual UI/anti-abuse/verified submissions are ready |
| DATABASE_URL | Existing local diagnostics only; never used by Phase A |

ZOHO_API_BASE_URL from the earlier placeholder design is not a Phase A setting; the verified name is ZOHO_API_DOMAIN. The local environment file is not automatically migrated or overwritten.

For Leads only, grant ZohoCRM.modules.leads.CREATE. Appointment mode additionally needs ZohoCRM.modules.contacts.READ, ZohoSearch.securesearch.READ, ZohoCRM.modules.contacts.CREATE and ZohoCRM.modules.custom.CREATE. The search scope is required by the documented Contacts/search endpoint; see the current scope breakdown in [Phase B](zoho-phase-b.md#minimum-oauth-scopes). Desk mode additionally needs Desk.tickets.CREATE, Desk.contacts.READ and Desk.contacts.CREATE. Do not request optional inventory/settings scopes for this phase.

The OAuth user owns records until an approved assignment rule exists. No rule ID is invented. Staff remain responsible for Deal conversion, Test_Drives, Quotes, discounts and confirmed availability. Automatic customer acknowledgement emails remain OFF in Zoho and are not promised by the website.

## Existing UI boundary and activation checklist

Phase A intentionally does not redesign/rebuild the existing website or silently change its illustrative inputs into verified CRM data. The current forms still produce version 1. Before enabling public live intake:
- Extend the existing forms to collect firstName/lastName separately, exact brand/condition/branch values and any request-specific fields.
- Add an approved Turnstile widget and consent text/version; collect the actual challenge token and explicit acceptance.
- Call submitVerifiedEnquiry with a stable retry key and version-2 values. Preserve the key on resultUnknown/inProgress; do not automatically generate a fresh key for an unresolved attempt.
- Add approved Arabic picklist labels, mapped to exact English values. A trade-in UI can use the implemented trade-in request kind; no new valuation or financial logic exists.
- Configure all pending secrets, bindings, working days and explicit routing choices in an approved staging environment.
- Verify real API creation in the approved AutoFlow layouts, workflow execution, Contact association, Desk routing/scopes, and safe failures; inspect records manually.
- Enable live intake only after those checks. Do not alter shared organization settings or another demo's records.

Live inventory, SalesIQ, finance/Books, automatic emails and assignment rules are outside this Phase A implementation. The handoff's admin setup steps remain pending and were not executed.

## Verification

Automated network calls are mocked. The test suite covers token caching/concurrency/invalidation; exact payloads/layouts; Lead-only routing; service email/phone reuse/create and ambiguous matches; Desk org/department and HTML escaping; field fences; calendar boundaries; 401/429/400/5xx handling; Turnstile; concurrency/rate/idempotency; partial service failures; safe diagnostics/public responses; legacy demo compatibility.

Validation commands:
- npm run test:website
- npm run lint
- Wrangler pages functions build functions to a temporary directory
- Wrangler deploy --dry-run --config workers/enquiry-guard/wrangler.jsonc to a temporary directory

No npm run build / website reconstruction, Cloudflare deployment, organization mutation, live OAuth exchange or real Zoho record creation was performed in this phase. Local credential-presence checks confirmed all three OAuth credentials are unset. Mock tests are not evidence of a successful live integration.

Official protocol references: [CRM v8 insert records](https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html), [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/). The user's verified handoff remains authoritative for organization-specific values.

## Recorded verification outcome

- 47/47 tests passed, using synthetic credentials and mocked external network calls.
- ESLint passed with no errors or warnings. The existing Node module-type notice is unrelated to the integration and was not addressed by changing global module semantics.
- Wrangler 4.148.0 compiled the final Pages Function successfully.
- Wrangler 4.148.0 bundled and validated the private guard configuration with --dry-run; no remote resource was created.
- All 86 checked verified constants matched the supplied handoff.
- .gitignore now covers nested guard Worker .wrangler caches as well as existing local environment files.
- The three actual Zoho OAuth credentials are not configured locally. No real OAuth exchange or API write was attempted.
- No Next.js build, UI redesign, dependency update or deployment was performed in Phase A.
