# Complete AutoFlow GCC Website Audit, Form Testing and Zoho Verification

Date: 8 November 2026. This report uses PASS, FAIL, NOT TESTED and PENDING APPROVAL literally. A mocked API result is never classified as a verified live Zoho creation.

The final scope follows your clarification: local and public read-only checks only; consent wording and operating calendars remain configurable and pending business approval. No Preview/Production deployment, Cloudflare setting change, Worker update, organization change or live business-record creation was performed in this audit.

## A. Project overview

### Architecture and scope

- Existing Next.js 16.4.3 App Router website, output: export, Node 24, build npm run build, output out.
- Root Cloudflare Pages Function: functions/api/enquiries.js, mounted at /api/enquiries through public/_routes.json.
- Server-only Zoho OAuth/client/mapping code under server/zoho.
- Shared version-2 form renderer in src/components/forms/enquiry-form.js; legacy v1 remains fail-closed for live use.
- Seven request kinds: contact, vehicle, quotation, drive, trade-in, service and support. Vehicle-detail dialogs reuse the vehicle/drive/quotation kinds.
- English/Arabic variants; 37 public routes and 36 canonical sitemap entries.
- No active login/authentication, callback-specific form, payment flow or operational dashboard was discovered. None was added.

### Exact reason for demonstration behavior

The quoted message is dictionaries.en.form.success in src/lib/website/dictionaries.js, with an Arabic counterpart.

src/services/website/enquiries.service.js sets enquiryMode to live only when NEXT_PUBLIC_ENQUIRY_MODE equals live. Otherwise submitVerifiedEnquiry delegates to the demo transport, which waits locally and returns mode:demo, delivered:false, confirmed:false, stored:false without an API POST.

src/components/forms/enquiry-form.js deliberately chooses that demo success text when result.mode is demo. It does not claim delivery. Local mode remains demo; the latest public form inspection also showed demo notices and preview submission buttons.

### Environment and security status

| Item | Verified status |
| --- | --- |
| ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET / ZOHO_REFRESH_TOKEN | Configured in ignored .env, unchanged; real OAuth works |
| US API domain | Token returned https://www.zohoapis.com; strict US validation remains |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Moved unchanged from .env.example into ignored .env |
| TURNSTILE_SECRET_KEY | Moved unchanged from unsafe NEXT_PUBLIC_SECRET_KEY into server-only .env; ROTATION REQUIRED |
| .env.example | Current working copy contains empty placeholders |
| .env.local / .dev.vars | Not present in this checkout |
| ENQUIRY_GUARD_SECRET | Present on deployed Worker by name-only inspection; local value absent |
| Pages service binding and Pages secret match | NOT TESTED; Pages access not granted |
| Public/runtime Turnstile actions | Not configured locally |
| Approved origins | Not configured locally |
| Approved EN/AR consent text and policy version | PENDING APPROVAL; not invented |
| Approved working weekdays, weekends, holidays and operating hours | PENDING APPROVAL; not invented |
| Live Lead/support flags | Not enabled locally; no activation performed |

The verified CRM Appointment_Time picklist remains unchanged; it is an allowed-value list, not an assertion of approved operating hours or slot availability.

### Important secret exposure finding - FAIL / owner remediation required

A private Turnstile value was stored as NEXT_PUBLIC_SECRET_KEY in .env.example. It was present in committed and staged versions; six reachable versions of that file were inspected. The previous integration-test assertion also echoed the value during a failing test in this audit.

Remediation completed locally:
- The exact credential was preserved under TURNSTILE_SECRET_KEY in ignored .env.
- The public alias was removed from current working files.
- Other credentials and DATABASE_URL were preserved.
- The test now reports only the variable name and that its value is redacted.
- No configured private values were found in the rebuilt frontend or the public HTML/scripts inspected.

The owner must rotate/revoke that Turnstile secret and update approved private settings. Current-file cleanup does not remove Git history or the old staged copy. No credential was rotated, Git history rewritten, file staged or commit created by this audit. Do not reuse the exposed secret for live activation.

## B. Form testing report

Frontend PASS below means local browser QA and appropriate unit tests. API connection does not mean a live record was created.

| Form | Frontend validation | API connection | Zoho record created | Field mapping | Result |
| --- | --- | --- | --- | --- | --- |
| General/contact, /en/contact/ and /ar/contact/ | PASS local | Public endpoint GET 405; live protected POST NOT TESTED | NOT TESTED, none created | PASS mocked Lead mapping; live NOT TESTED | PENDING APPROVAL |
| Generic vehicle enquiry, contact?request=vehicle | PASS local | Same version-2 endpoint; live POST NOT TESTED | NOT TESTED | PASS mocked | PENDING APPROVAL |
| Vehicle-details enquiry dialogs | PASS local; all eight vehicles in both languages opened | Same vehicle route; live POST NOT TESTED | NOT TESTED | PASS mocked, display reference not used as CRM ID | PENDING APPROVAL |
| Request quotation, contact?request=quotation and dialogs | PASS local | Same endpoint; live POST NOT TESTED | NOT TESTED | PASS mocked Lead mapping; no Quotes creation | PENDING APPROVAL |
| Test-drive request, contact?request=drive and dialogs | PASS local; date/licence checked | Same endpoint; live POST NOT TESTED | NOT TESTED | PASS mocked Lead mapping; no Test_Drives creation | PENDING APPROVAL |
| Trade-in, contact?request=trade-in | PASS local | Same endpoint; live POST NOT TESTED | NOT TESTED | PASS mocked trade-in fields | PENDING APPROVAL |
| Service/appointment booking, /service-request/ | PASS local; dates/times/options checked | Same endpoint; live POST NOT TESTED | NOT TESTED | PASS mocked Contact plus Requested appointment | PENDING APPROVAL |
| Support, /customer-support/ | PASS local | Latest public route 200; live POST NOT TESTED | NOT TESTED | PASS mocked AutoFlow Desk fields | PENDING APPROVAL |
| Dedicated callback request | Not present | Not present | NOT TESTED | Not applicable | NOT TESTED |

Local browser evidence:
- 14 primary cases: all seven kinds in English and Arabic.
- Required fields, invalid email/phone, dropdowns, relevant past dates and driving-licence checkbox checked.
- Loading/disabled state checked; two immediate submit events did not bypass the pending lock.
- Demo completion resets appropriate fields; simulated recoverable failure preserves entered values.
- 48 vehicle dialogs across 16 localized vehicle-detail pages opened and closed with Escape/focus restoration.
- No local demo API POSTs and no live Zoho business records were created.
- Consent UI and genuine Turnstile challenges remain NOT TESTED in live mode because approved settings are pending. Unit fixtures are synthetic and are not business configuration.

## C. Zoho integration report

| Integration | API status | Record ID verified | Result |
| --- | --- | --- | --- |
| Zoho OAuth | Actual refresh HTTP 200; US api_domain verified | Not a business record | PASS |
| Zoho CRM Leads | Actual no-match read search HTTP 401, OAUTH_SCOPE_MISMATCH; CREATE not attempted | None created, NOT TESTED | FAIL for requested read verification; live CREATE NOT TESTED |
| Zoho CRM Contacts | Actual unique no-match search HTTP 204; CREATE not attempted | None created, NOT TESTED | PASS search/read connectivity; creation NOT TESTED |
| Service Appointments | Actual no-match read search HTTP 401, OAUTH_SCOPE_MISMATCH; CREATE not attempted | None created, NOT TESTED | FAIL for requested read verification; creation NOT TESTED |
| Zoho Desk Tickets | No live ticket API write/read attempted | None created, NOT TESTED | NOT TESTED |

The 401 results do not prove that CREATE is denied. They establish that the current grants did not authorize those read searches. The Zoho administrator must review least-privilege READ grants for record verification. Search may additionally require ZohoSearch.securesearch.READ; see the [official Search Records scope requirements](https://www.zoho.com/crm/developer/docs/api/v8/search-records.html). No scopes, tokens or organization settings were changed.

Mappings verified through code and mocked protocol tests:
- Leads layout 5413253000014418033; Website Enquiry, New Enquiry, workflow trigger and lar_id=5413253000014544001.
- Mandatory names, mobile, exact English brand/condition/branch values, model and approved next-working-day calculation retained.
- Arabic names/messages preserved; Arabic phone digits normalize to international digits and Preferred_Language maps to Arabic.
- Service Contacts use Primary_Contact_First_Name, not First_Name. Returned Contact ID goes directly into Customer.id, avoiding search indexing delay.
- Appointments use AutoFlow layout 5413253000014444017 and Requested status, never Confirmed.
- Desk department 759804000005916029, org 785172113, cf_af_ticket_category and cf_af_branch; no shared category/subCategory or invented assignee.
- Public receipts still contain no internal Zoho IDs. No fake fixture ID is presented as a live record ID here.

No notifications, messages, confirmed appointments, payments or commitments were initiated. Existing automation remains unchanged. A future live write run needs approved safe contacts and confirmation that notification behavior is safe.

### Guard and complete flow

Code flow: validate input/origin/settings -> private guard rate/idempotency claim -> Turnstile verification -> OAuth and allowlisted Zoho write -> guard completion -> safe public receipt.

The guard claim intentionally precedes the external Turnstile request so rate/retry protections apply first. Mocked tests cover the chain, including invalid/expired challenges, concurrency and ambiguous partial service creation. This is not a verified live end-to-end chain.

Read-only Cloudflare evidence:
- Worker autoflow-enquiry-guard exists and is deployed.
- Latest inspected deployment: ddcdb71c-d3d1-4400-a2a7-d7afdfc8837e.
- Version 32f141ec-beef-45e1-acd0-86c50c5399b8 at 100%.
- ENQUIRY_GUARD_SECRET name is present on that Worker; its value was not inspected.
- Pages must expose a service binding named ENQUIRY_GUARD targeting that Worker. The Worker uses STATE internally.
- Actual Pages binding/secret equality and a live guard claim remain NOT TESTED. The plain local static preview has no Pages context.env service binding. No fake binding was used to claim live success.

## D. Button and link report

PASS in local browser QA:
- 18 desktop navigation clicks and 18 footer navigation clicks.
- Mobile menus in both languages, item navigation, Escape and focus restoration.
- Both language selectors, with request/reference context retained and unknown query fields discarded.
- Search, combined brand/condition filters, sorting, clearing and load-more pagination in both languages.
- All 16 localized galleries and 48 associated enquiry/drive/quotation dialog controls.
- Internal references resolve to all 37 expected paths.

Verified issue fixed: SUV galleries previously offered the same image in two thumbnail positions. Each of the three existing choices now selects a distinct illustrative image.

Latest public read-only scan: all 37 URLs returned 200. Both /api/enquiries GET requests returned 405, which is the Function's expected method rejection. Earlier 404 evidence was superseded during the audit by an external deployment; this audit performed no deployment.

No dedicated login, call, email, WhatsApp, accordion, cookie-banner or back-to-top control was discovered in application source. No new controls or business contact details were invented. SalesIQ/provider messaging was not exercised; no chat message was sent.

## E. Error and success message report

Verified fixes:
1. Unrecognised HTML/JSON gateway 5xx failures now become resultUnknown. The form retains its request state and cannot silently authorize a fresh submission after an ambiguous upstream create.
2. Explicit application preflight failures remain recoverable; legacy behavior is retained.
3. Turnstile missing/invalid server-secret responses now classify as integration_unconfigured, and provider internal failures as unavailable. Visitors are no longer incorrectly told that a server configuration error is their challenge failure.
4. Invalid/expired challenge responses still reject with challenge_failed. See [Cloudflare Siteverify behavior](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
5. Example-configuration assertions redact values instead of echoing them.

PASS: local required/email/phone/date/licence messages, demo success, error data retention and busy state. Protocol tests cover invalid authorization, provider validation, unavailable requests, rate limiting, concurrency, nonce conflict, partial service failure and ambiguous retry outcomes.

NOT TESTED: real successful form delivery, genuine challenge completion/expiry, live provider creation/assignment errors and live success messages. No demo success was represented as real Zoho delivery.

## F. English and Arabic report

PASS:
- All localized routes load locally.
- Translation key parity and populated labels.
- Arabic/RTL layout in responsive checks.
- Validation/error/demo success text checked in both languages.
- Language switching preserves allowlisted context.
- Actual Arabic names/messages survive parser and Lead/Contact/appointment/Desk builders in synthetic unit tests.
- No page errors in local browser QA.

NOT TESTED: persistence of Arabic values in real newly created Zoho records. No claim of live Arabic record verification is made.

## G. Performance, SEO and build report

| Check | Result |
| --- | --- |
| Full regression suite | PASS, 75/75 |
| ESLint | PASS |
| npm run build | PASS, 43 static entries |
| Wrangler Pages Functions compilation | PASS |
| Local public routes | PASS, 37 |
| Distinct canonical URLs / sitemap entries | PASS, 36 |
| Main H1, metadata and JSON-LD | PASS on checked exports |
| Responsive image references | PASS, 28 referenced image paths, including picture sources |
| Internal route links | PASS, 37 paths |
| Responsive checks | PASS, 60 at 320/375/768/1280/1536 |
| Current public routes | PASS, 37 returned 200 |
| Current public API availability | PASS method check, GET 405 on both domains; POST NOT TESTED |
| Private values in local export | 0 matches across 246 text assets |
| Private values in public HTML/scripts | 0 matches in checked pages and 10 public scripts |
| Cloudflare/runtime architecture | Preserved; no remote changes |
| Git whitespace check | PASS |

Existing lazy loading, WebP/picture assets, deferred vehicle forms and SEO configuration were preserved. No new dependency was introduced. No fresh Lighthouse/field Core Web Vitals score was measured in this form audit; earlier performance measurements remain historical.

## H. Remaining issues

### Business approval - PENDING APPROVAL

As instructed, do not fill defaults:
- ENQUIRY_CONSENT_TEXT and ENQUIRY_CONSENT_TEXT_AR.
- NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_EN and NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_AR.
- ENQUIRY_CONSENT_VERSION and NEXT_PUBLIC_ENQUIRY_CONSENT_VERSION.
- ZOHO_WORKING_WEEKDAYS, optional approved holidays and any operating-hour/availability policy.
- Support routing decision and safe live review-contact/notification policy.

### Security owner action - FAIL until remediated

Rotate/revoke the exposed Turnstile secret and update approved server-side configuration. Remove any unsafe public secret alias from build settings if present; remote Pages variables were not inspected, so its remote presence is not assumed. Current local credentials were relocated unchanged, not replaced. Git history/index still contain the old value; no destructive Git operation was performed.

### Zoho administrator access

Resolve the observed Leads and Service_Appointments read/search OAUTH_SCOPE_MISMATCH before requiring read-back verification of created records. Desk creation/assignment and read permissions remain unverified. Do not broadly grant unrelated module/settings scopes.

### Cloudflare Preview configuration - NOT TESTED under the approved scope

The current CLI token does not permit Pages inspection. Automatic approval review rejected a login requesting pages:write because it exceeded inspection scope; Wrangler's listed Pages OAuth option was only pages:write. You then chose local/public read-only checks, so no further permission or deployment attempt was made.

After separately approved access and business configuration, verify:
- Preview ENQUIRY_GUARD binding and matching encrypted guard secret.
- Real rotated TURNSTILE_SECRET_KEY, public site key and matching ENQUIRY_TURNSTILE_ACTION / NEXT_PUBLIC_ENQUIRY_TURNSTILE_ACTION.
- Approved ENQUIRY_ALLOWED_ORIGINS.
- Preview OAuth secrets and least-privilege grants.
- Approved Lead/service/support flags and NEXT_PUBLIC_ENQUIRY_MODE=live.
- Real record creation and read-back, first in Preview.

No Production form submission was authorized or performed. Production still displays demo mode. The new local fixes have not been published by this audit.

## I. Final status

| Feature | Classification |
| --- | --- |
| Existing local website routes, controls, forms and responsive layouts | PASS |
| Local validation, modeled failure paths and mapping tests | PASS |
| Current public routes and API method availability | PASS |
| OAuth refresh and CRM Contacts read connectivity | PASS |
| Guard deployment and secret-name presence | PASS metadata only |
| Leads/appointments read-search permission | FAIL, HTTP 401 OAUTH_SCOPE_MISMATCH |
| Turnstile private-key exposure | FAIL; local cleanup done, owner rotation required |
| Live form-to-Zoho record creation and returned IDs | NOT TESTED |
| Actual Pages Preview bindings / genuine Turnstile / Desk assignment | NOT TESTED |
| Business consent/calendar and live activation | PENDING APPROVAL |

### Changes made in this audit

- src/services/website/enquiries.service.js: safe ambiguous gateway classification.
- server/zoho/protection.js: correct Turnstile configuration/provider failure classification.
- src/components/vehicles/vehicle-gallery.js: distinct thumbnail choices.
- tests/integration.test.mjs: redact configuration values in assertions.
- tests/zoho-audit.test.mjs: five targeted regression tests, including real Arabic text in mocked mapping tests.
- Ignored .env / tracked .env.example working copy: existing keys relocated unchanged to correct names; example placeholders cleared. No environment file was committed.
- This report and sanitized evidence, plus links from existing documentation.

No Zoho modules/layouts/settings, Cloudflare resources, Worker code/config, production application, dependencies or unrelated Gulf Infotech files were changed. No business records or external customer notifications were created.

Local evidence files are in %TEMP%/autoflow-complete-form-audit. See the accompanying sanitized JSON summary for counts and HTTP statuses; it contains no credential values or private provider response bodies.
