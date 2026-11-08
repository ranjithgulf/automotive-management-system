> Current cleanup verification: [webform-era cleanup audit](webform-cleanup-audit-2026-11-08.md). Earlier API modules and their tests are retired; the seven iframe integrations below remain active.

# AutoFlow GCC published Zoho CRM webforms

8 November 2026. Recovered from the seven user-supplied published URLs and read-only inspection of their actual hosted responses. The earlier referenced document/configuration files were unavailable in the checkout, Desktop, Downloads and supplied attachment folders. No Zoho script, internal form ID, field mapping or hidden value was reconstructed.

Configuration: `src/config/zohoWebforms.ts`. Renderer: `src/components/forms/zoho-webform.js`. Existing entry component: `src/components/forms/enquiry-form.js`.

| Kind | Published URL | Existing location (English and Arabic) | Verified hosted title |
| --- | --- | --- | --- |
| contact | https://zcform.com/U93KB | /{locale}/contact/ | AutoFlow GCC - General Enquiry |
| vehicle | https://zcform.com/Y9rnh | /{locale}/contact/?request=vehicle; vehicle enquiry modal | AutoFlow GCC - Vehicle Enquiry |
| quotation | https://zcform.com/1ZkiW | /{locale}/contact/?request=quotation; quotation modal | AutoFlow GCC - Quotation Request |
| drive | https://zcform.com/g6Csv | /{locale}/contact/?request=drive; test-drive modal | AutoFlow GCC - Test Drive Request |
| trade-in | https://zcform.com/aBJ42 | /{locale}/contact/?request=trade-in | AutoFlow GCC - Trade-in Request |
| service | https://zcform.com/hpFYm | /{locale}/service-request/ | AutoFlow GCC - Service Booking |
| support | https://zcform.com/CkrU4 | /{locale}/customer-support/ | AutoFlow GCC - Support Request |

## Embed configuration and boundaries

All seven use a plain inline iframe with the exact published URL. Each URL returned HTTP 200 after redirecting inside the iframe to crm.zohopublic.com/crm/WebFormServeServlet. Hosted titles match the table. No X-Frame-Options or CSP frame-ancestors response-header restriction was present at inspection.

Frames use width 100%, localized accessible titles and conservative measured heights. Hosted forms were inspected at 270px and 500px frame widths: no horizontal overflow; content heights ranged from 475 to 767px. The published CSS has a mobile breakpoint at 600px. Height settings include spare space for validation and may need review if Zoho adds fields. Cross-origin access prevents the website from measuring iframe content at runtime. The inspected scripts send CAPTCHA signals, but provide no verified height-resize protocol; no guessed message listener or resize script was added. Browser load/error events and a 20-second slow-load notice provide an inline reload control. A cross-origin load event cannot prove successful internal rendering; the reload control remains available after load for blank/blocked cases.

Sandbox permissions are allow-forms, allow-scripts, allow-same-origin and allow-modals. Popups and top-level navigation are not permitted. No external link, window.open or target=_blank is used. Vendor success redirects can navigate within the iframe; attempted parent redirects are blocked. Published post-submit behavior still requires separate authorized acceptance testing. Existing page and dialog scrolling is retained; the iframe is sized to avoid a second scrollbar for the inspected content.

The surrounding website, headings, reference display and loading/retry controls retain English/Arabic support. Hosted forms currently publish English labels and LTR CSS, including on Arabic website pages. This integration does not translate or alter cross-origin Zoho content. Arabic versions must be published/configured in Zoho if bilingual embedded fields are required. Website reference/topic/query context is displayed where already supported but is not injected into unverified Zoho fields.

## Submission ownership

These seven visible forms now submit only through Zoho's hosted form. The old demo/live browser transport is no longer imported by the visible form component. The obsolete server-side OAuth/API modules, Turnstile, guard and demo/live transport were removed during the subsequent cleanup. These embedded forms do not call /api/enquiries and require no enquiry-mode flag.

All seven URLs are CRM Leads webforms, including Service Booking and Support Request. These embeds do not create Contacts + Service_Appointments or Desk tickets. No extra API call is made to duplicate submissions. Zoho owns the mandatory fields, consent, CAPTCHA, routing, notifications and post-submit response. Do not assume the old Function's Turnstile/guard/consent checks apply to direct webform submissions. Review those settings in Zoho before launch; no settings or credentials were changed here.

No submissions or test Leads are authorized for this task. Browser verification must block record-creation requests and avoid submitting even empty forms. Static export is retained; no Pages Function is needed by the current application. No deployment is performed.

## Local verification

- npm run test:website: 79/79 passed, including published URL and route-intent regression tests; existing API tests remain mocked.
- npm run lint: passed.
- npm run build: passed; 43 static build entries and out export. No dependencies or Next.js configuration changed.
- Chrome: 40/40 cases passed: seven page-based forms plus three vehicle modal forms, each in English/Arabic at 375px and 1280px. Every frame loaded its matching actual hosted title and one form.
- No outer or iframe horizontal overflow, no iframe vertical overflow for current content, no JavaScript page errors, no popups, no parent navigation away from the local website and no POST attempts. Modal close removes its iframe. All non-read requests were blocked defensively; no form was filled or submitted. SalesIQ requests were blocked in the isolated form checks.
- Public URLs returned HTTP 200; their current hosted titles and responsive layout were inspected without changing Zoho settings.
- Existing Node module-type notices remain. No deployment or real record-creation/notification verification was performed.

## Published-form limitations requiring Zoho owner review

Read-only inspection of the published labels found no dedicated test-drive date/time fields on the Test Drive form; no dedicated service type/date/time fields on Service Booking; and no dedicated support category field on Support Request. These forms provide Description, but this integration does not infer missing values or alter the published forms. Publish approved fields in Zoho if structured capture is required.

English desktop and Arabic mobile painted iframe content were also visually reviewed after scrolling into view. Inline reload was verified in both languages: one replacement iframe, with the old frame detached. Post-submit behavior and actual Lead creation remain untested because submissions were not authorized.
