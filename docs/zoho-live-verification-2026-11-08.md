# AutoFlow GCC: live connection verification

Date: 8 November 2026.

## Verified with real Zoho requests

- OAuth refresh returned HTTP 200 from the verified US accounts endpoint.
- A real access token was obtained in memory; its value was never printed or saved.
- Returned API domain: https://www.zohoapis.com.
- An authenticated CRM Contacts/search request succeeded for a unique synthetic no-match email.
- No matching records were returned. No customer data was printed.
- This verifies OAuth and CRM Contact read access. It does not verify Lead CREATE, appointment CREATE or Desk CREATE permissions.

The first local probe timed out before receiving an HTTP response. A second diagnostic used a 20-second local timeout and succeeded. Production timeout code was not changed.

## Credential handling

The supplied ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN were found in the Git-tracked .env.example. They were copied into AutoFlow's existing ignored .env, verified byte-for-byte after parsing, then cleared from .env.example.

The existing DATABASE_URL was preserved. No credential values appear in this report. Four reachable historical versions of .env.example and its staged version were checked; these exact secrets were not found in either. No Git history or staging changes were made.

## Live website findings

| Check | Observed result |
| --- | --- |
| gizoauto.com contact form | Older full-name form; button says Preview enquiry submission |
| gizoauto.com/api/enquiries | HTTP 404 |
| automotive-management-system.pages.dev/api/enquiries | HTTP 404 |
| gizoauto.com/en/customer-support/ | HTTP 404 |
| Current local UI mode | demo |
| Cloudflare CLI access | Authentication unavailable; remote secret values/settings were not inspected |

Adding OAuth credentials locally does not deploy the newer form code or root Pages Functions.

## Workflow verification status

| Workflow | Current code/mocked mapping | Real end-to-end creation |
| --- | --- | --- |
| General contact | Lead, required fields and assignment rule covered | Not verified |
| Vehicle enquiry | Lead covered | Not verified |
| Quotation | Lead, quotation prefix covered | Not verified |
| Test drive | Lead, requested date/time/licence covered | Not verified |
| Trade-in | Lead and trade-in fields covered | Not verified |
| Service booking | Contact lookup/create and Requested appointment covered | Not verified |
| Support | Configurable AutoFlow Desk ticket or Lead fallback covered | Not verified |

English and Arabic workflows are covered by the existing tests. No live Lead, Contact, appointment or Desk ticket was created in this verification. Review records were not invented merely to bypass missing website activation/protection settings.

## Checks after securing the credentials

- npm run test:website: 70/70 passed; workflow API calls in this suite are mocked.
- npm run build: passed, 43 static build entries.
- Rebuilt export scanned: 246 text files; zero matches for configured OAuth credentials, the database URL or its password.
- .env remains Git-ignored; .env.example credential placeholders are empty.
- No application source, dependencies, Cloudflare account settings or Gulf Infotech files were changed.

## Required before real form-submission checks

Use [Phase B activation instructions](zoho-phase-b.md):
1. Deploy the latest AutoFlow checkout with root Pages Functions; retain Node 24, npm run build and output out.
2. Configure encrypted server credentials in Cloudflare, not only the local .env.
3. Configure the real Turnstile site key/secret and matching action, private ENQUIRY_GUARD binding/secret, approved origins and consent version/text in both languages.
4. Provide the approved working weekdays/holidays for Lead follow-ups.
5. Enable the approved Lead/service/support routes and build-time live mode in the approved environment.
6. Verify real form-created records and routing using approved review data after the endpoint is available.

No deployment or public live activation was performed. OAuth success alone must not be reported as successful integration of all forms.
