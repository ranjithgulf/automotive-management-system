# AutoFlow GCC: Phase B integration readiness

> Update, 8 November 2026: local credentials are now secured and real OAuth plus CRM Contact read access were verified. Live website submissions remain blocked by the older deployment and missing activation settings. See [current verification](zoho-live-verification-2026-11-08.md). Earlier credential-pending statements below describe the 6 November baseline.

6 November 2026. Implementation/local verification complete; **NOT a verified live website-to-Zoho integration**. Public intake remains demo by default.

## Evidence and boundaries

Read the complete 633-line round-2 handoff at C:/Users/HELLO MENTOR/Downloads/ZOHO_INTEGRATION_HANDOFF (1).md and the complete [Phase A guide](zoho-phase-a.md).
Handoff SHA-256: 04419a0fdc4d5fa773b5d4f0c135d855aa0487fbe0d1848c7fc736fe677bbd06.

The handoff reports earlier administrator live verification. This repository's OAuth client is not configured, so that report is not evidence of a successful live integration from this application. Embedded admin setup instructions are future owner actions, not actions executed here. No remote settings, resources, records or other demos were changed. Only the existing AutoFlow checkout was edited; Gulf Infotech was untouched. Existing uncommitted work and the ignored local .env were preserved.

This guide supersedes the Phase A statements about a pending assignment rule, unavailable Desk custom fields, disabled-by-default direct service route and legacy UI.

## Implemented behavior

- Every Lead POST passes **lar_id=5413253000014544001** as a top-level JSON body property alongside data at the final server API boundary, including fallback Leads; the URL has no lar_id query parameter. The optional ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID override must match. No Owner is sent; the verified rule currently assigns all 12 branches to John Doe.
- Leads retain layout 5413253000014418033, Website Enquiry / New Enquiry, next approved Dubai working date and trigger ["workflow"]. Distinct enquiries always insert, preserving the duplicate-note workflow.
- Vehicle enquiries, quotations, drives and trade-ins create Leads, never Quotes, Deals or Test_Drives. Trade-in uses the existing contact route with ?request=trade-in and bilingual request links.
- Direct service booking is now the default implementation route, equivalent to ZOHO_SERVICE_MODE=appointment. Set disabled to explicitly disable it; lead remains configurable. Global demo, missing credentials and all security gates still prevent live writes.
- Service searches Contacts by email, then phone. 204 means not found. Reuse one unambiguous match or create a Contact using Primary_Contact_First_Name (NOT First_Name), Last_Name, Mobile, optional Email and the verified Standard layout. Use the **ID returned by POST immediately**, without re-searching or polling. CRM search may lag creation by about 15 seconds, which does not block the appointment.
- Appointments use layout 5413253000014444017, Customer.id, Requested status, exact branch/service type/half-hour time and the provided vehicle context. Never invent Vehicle/Advisor/Account IDs. Requested does not mean Confirmed.
- If Contact creation succeeds but appointment creation fails, hold that attempt for reconciliation rather than replaying a partial workflow during indexing delay. Separate simultaneous booking intents can still find no indexed Contact; distributed customer-identity deduplication/merging is not claimed.
- Desk remains disabled until ZOHO_SUPPORT_MODE=desk. Its org is 785172113, department 759804000005916029 and department-default layout 759804000005918977. No unsupported layout parameter is invented.
- Tickets use cf.cf_af_ticket_category and cf.cf_af_branch, plus optional cf.cf_af_vehicle_plate_number. All 12 categories and all 12 branches match the handoff. Shared category/subCategory, foreign custom fields, assigneeId and dueDate are prohibited. Desk contacts remain separate from CRM Contacts.
- Existing forms now collect separate first/last names and exact required fields. Arabic draft labels come from handoff section 11; option values remain exact English CRM strings. Brands stay Latin-script trademarks. Existing contact topics, references, routes, dialogs and demo failure controls remain.
- No live inventory, financial calculation, SalesIQ widget or customer email automation was introduced. Customer success copy promises neither email delivery nor appointment confirmation.

## Turnstile, consent and retry readiness

The existing forms use version 2. Legacy version-1 compatibility remains, with live legacy intake failing closed.

Turnstile uses explicit rendering, configured locale/action, expiry/error invalidation, navigation cleanup and a fresh widget after attempted submission. Only live mode loads it. Missing approved widget/consent settings disables live submission. Server validation still requires the secret, matching hostname and action. Reference: [Cloudflare explicit rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

Consent is explicit and unchecked by default. No legal text was invented. Configure identical approved wording/version on both sides:

| Browser build-time variable | Matching Pages runtime variable |
| --- | --- |
| NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_EN | ENQUIRY_CONSENT_TEXT |
| NEXT_PUBLIC_ENQUIRY_CONSENT_TEXT_AR | ENQUIRY_CONSENT_TEXT_AR |
| NEXT_PUBLIC_ENQUIRY_CONSENT_VERSION | ENQUIRY_CONSENT_VERSION |
| NEXT_PUBLIC_ENQUIRY_TURNSTILE_ACTION | ENQUIRY_TURNSTILE_ACTION |

Arabic intake fails closed without approved Arabic runtime wording. Consent wording, version and server timestamp stay in Description/Customer_Notes/ticket description until real consent field API names are verified.

Retry keys stay stable for the same attempt. Form data remains on failures. Ambiguous network/write outcomes, pending and conflicting attempts lock the form for review, preventing a fresh automatic submit. No customer data is saved in localStorage. Reloading loses local retry state: manually reconcile before resubmitting an unresolved request. Public responses contain no internal IDs.

The existing private guard remains required: atomic claims, five attempts per ten minutes per HMAC-hashed IP, 24-hour pseudonymous security metadata retention. No raw IP or customer messages/Zoho records are stored there. Approve retention/capacity. Ambiguous POSTs are not blindly retried; definite throttles and safe reads retain bounded retries.

## Exact manual owner actions

1. Approve EN/AR consent wording/version, review draft Arabic labels, specify working weekdays (0=Sunday through 6=Saturday), optional holidays, and guard retention/rate policy. Decide whether support uses Desk. Direct Contact + Requested appointment is implemented as requested.
2. Complete Zoho API-console MFA and create the approved Self Client. Exchange its grant outside the repository. For all implemented routes use:
   ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.contacts.READ,ZohoSearch.securesearch.READ,ZohoCRM.modules.contacts.CREATE,ZohoCRM.modules.custom.CREATE,Desk.tickets.CREATE,Desk.contacts.READ,Desk.contacts.CREATE.
   Omit Desk scopes if Desk is not approved; do not add inventory/settings scopes. Creating a dedicated licensed user requires separate business approval.
3. In Pages project **automotive-management-system**, set encrypted secrets for Production and Preview: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, TURNSTILE_SECRET_KEY, ENQUIRY_GUARD_SECRET. The guard secret must be cryptographically random and at least 32 characters. Use dashboard Secret inputs or interactive prompts; never source files, chats or command arguments.
4. Before deploying the guard, confirm the two existing Workers named in the handoff do not intercept gizoauto.com, and check the proposed guard name for conflicts. Deploy the approved private Worker/DO using workers/enquiry-guard/wrangler.jsonc. Set its encrypted ENQUIRY_GUARD_SECRET to the same value as Pages. Add a Pages **service binding named ENQUIRY_GUARD** to it. The Worker's STATE DO binding/migration comes from its config. Keep workers.dev/preview URLs disabled. Optional ZOHO_TOKEN_CACHE is a private KV binding. Resource bindings are not plain variables. No deployment occurred here.
5. Create Turnstile for gizoauto.com and actual Preview hosts, including automotive-management-system.pages.dev when used. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY before building and its matching runtime secret. Choose the action and set the identical public/runtime names listed above.
6. Retain the handoff's nine verified plain Cloudflare variables, including ZOHO_CRM_API_VERSION=v8 and ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID=5413253000014544001. These were reported as already set; this session did not inspect/change the remote account. Configure runtime flags and approvals:

| Runtime setting | Required value/action |
| --- | --- |
| ZOHO_ENABLE_CRM_LEADS | true when approved |
| ZOHO_SERVICE_MODE | appointment (default; explicitly set for clarity) |
| ZOHO_SUPPORT_MODE | desk only after routing/scopes approval; otherwise disabled |
| ZOHO_WORKING_WEEKDAYS | Approved CSV numbers 0-6, required for Leads |
| ZOHO_HOLIDAYS | Optional approved CSV YYYY-MM-DD |
| ENQUIRY_ALLOWED_ORIGINS | Actual approved HTTPS origins, without paths/trailing slash |
| ENQUIRY_CONSENT_TEXT / ENQUIRY_CONSENT_TEXT_AR | Approved wording matching public EN/AR values |
| ENQUIRY_CONSENT_VERSION | Approved version matching public value |
| ENQUIRY_TURNSTILE_ACTION | Matching public action |

The handoff verifies https://gizoauto.com and https://automotive-management-system.pages.dev. Allow only each environment's actual origins. Additional branch Preview hostnames require explicit Turnstile/origin approval.

7. Default browser forms target appointment/Desk. If deliberately choosing a Lead fallback, set NEXT_PUBLIC_ENQUIRY_SERVICE_MODE=lead and/or NEXT_PUBLIC_ENQUIRY_SUPPORT_MODE=lead before building, with matching runtime flags and enabled Leads. These public flags contain no IDs and reveal all mandatory Lead fields. Otherwise leave them blank.
8. Keep static export, Node 24, build **npm run build**, output **out**, and root Pages Functions. Set SITE_URL to the handoff-verified approved public origin. Public consent/widget/mode values are inlined at build time; runtime secrets alone cannot change them. Use a separately restricted Preview OAuth client/resources where practical.
9. After configuration, set NEXT_PUBLIC_ENQUIRY_MODE=live in approved Preview and redeploy. Verify real OAuth refresh/api_domain, Lead assignment/workflow, existing/new Contact association, Requested appointment, Desk custom fields/assignment and safe failures in both languages. Use approved synthetic records and the handoff naming rule; inspect manually and clean up only those approved verification records. Do not resubmit unresolved writes blindly.
10. Enable Production live mode and redeploy only after real acceptance. SalesIQ remains plan-blocked: no widget or other demo's brand reuse. Customer email workflows/Desk notifications remain inactive; SPF/DKIM and explicit business approval are separate requirements before activating any emails.

All .env.example assignments are empty. Local OAuth credentials remain unset. No secrets were invented or exposed.

## Files changed in Phase B

| Files | Purpose |
| --- | --- |
| server/zoho/verified.js | Assignment rule, public-choice re-export, direct-service default |
| server/zoho/client.js | Mandatory lar_id, strict settings and Desk custom-field fence |
| server/zoho/service.js | Direct booking, indexing-delay handling, partial-workflow protection |
| server/zoho/validation.js | Ticket category and retained contact topic validation |
| server/zoho/mappings.js | Desk cf values, localized consent audit, contact topic |
| server/zoho/protection.js | Settings, Desk fields and locale consent preflight |
| src/lib/website/zoho-choices.js | Public-only verified choices and handoff Arabic labels |
| src/lib/website/verified-forms.js | Field lists, choices, validation, Dubai dates and fallback fields |
| src/lib/website/integration-labels.js | Bilingual labels and safe error text |
| src/components/forms/enquiry-form.js | Existing forms wired to version 2, separate names, consent and retry safety |
| src/components/forms/turnstile.js | Widget lifecycle |
| src/lib/website/enquiry-contract.js | Category/contact-topic whitelist |
| src/services/website/enquiries.service.js | Safe ambiguous browser outcome |
| src/components/website/request-actions.js; src/lib/website/dictionaries.js | Trade-in action in both languages |
| tests/zoho-phase-a.test.mjs | Updated Phase A expectations and Phase B coverage |
| .env.example | Empty configuration placeholders and current comments |
| README.md; docs/zoho-phase-a.md; docs/zoho-integration-handoff.md; docs/zoho-phase-b.md | Current documentation and historical notices |

Dependencies, lockfile, local secrets, deployment routes, Next.js configuration and shared organization settings were not changed in Phase B.

## Verification

| Check | Result |
| --- | --- |
| npm run test:website | 68/68 pass, all external APIs mocked |
| npm run lint | Pass, no lint errors/warnings |
| npm run build | Pass, 42 static build entries, out export |
| Wrangler 4.148.0 Pages Functions compilation | Pass |
| Guard deploy --dry-run | Pass; no deployment |
| Chrome exported forms | 14/14 workflows, seven kinds per language; validation and demo completion |
| Mobile forms, 375px | 6/6, trade-in/service/support per language; no horizontal overflow |
| Browser diagnostics | No page errors or demo POSTs |
| Export scan | 246 text assets; no configured local secrets or verified internal Zoho IDs |
| git diff --check | Pass |

The existing Node module-type notice remains; no unrelated global module setting was changed. The production artifact stays demo with no fabricated widget/consent configuration. Real Turnstile challenges, remote routes/bindings, OAuth/API writes, actual assignment and notifications require owner acceptance above.

## Minimum OAuth scopes

Updated 8 November 2026 from the actual allowlisted client operations and [Zoho CRM v8 Search Records documentation](https://www.zoho.com/crm/developer/docs/api/v8/search-records.html).

| Enabled route / operation | Minimum applicable scopes |
| --- | --- |
| Sales Lead insertion (including explicitly selected Lead fallbacks) | ZohoCRM.modules.leads.CREATE |
| Service Contact search by email, then phone | ZohoCRM.modules.contacts.READ **and** ZohoSearch.securesearch.READ |
| Service Contact creation when neither search matches | ZohoCRM.modules.contacts.CREATE |
| Custom Service_Appointments insertion | ZohoCRM.modules.custom.CREATE |
| Desk ticket insertion with inline contact | Desk.tickets.CREATE; retain Desk.contacts.CREATE for contact creation. The existing approved Desk.contacts.READ grant is retained, but this code makes no separate Desk contact-read request. |

Contact searches use GET https://www.zohoapis.com/crm/v8/Contacts/search with exactly one URL-encoded email or phone query parameter, Authorization: Zoho-oauthtoken, and no request body. HTTP 204 means no match; one match is reused; ambiguous results stop the workflow. A newly created Contact's returned ID is used directly for the appointment, without waiting for search indexing.

The supplied grants omitted ZohoSearch.securesearch.READ. Zoho documents that scope in addition to module READ for the actual search endpoint used here. OAuth credentials and grants were not changed or tested live by this correction. No Leads.READ, custom.READ, settings, or broad ALL scope is needed by the submission code; separate record read-back tooling would have its own scope requirements.

Lead requests now use POST https://www.zohoapis.com/crm/v8/Leads and the JSON envelope { data: [record], trigger: ["workflow"], lar_id: "5413253000014544001" }, matching [Insert Records](https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html). The write fence accepts only that verified rule for Leads and rejects lar_id on Contacts and Service_Appointments. Earlier mocked verification did not establish correct assignment-rule placement; the corrected tests assert the exact wire URL/body across sales and fallback routes.
