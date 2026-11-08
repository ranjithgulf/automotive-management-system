import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getAccessToken, invalidateAccessToken } from "../server/zoho/oauth.js";
import { createZohoClient } from "../server/zoho/client.js";
import { parsePhaseARequest } from "../server/zoho/validation.js";
import { buildLead, buildContact, buildAppointment, buildDeskTicket, nextFollowUpDate } from "../server/zoho/mappings.js";
import { VERIFIED, BRANCHES } from "../server/zoho/verified.js";
import { submitCrmEnquiry } from "../server/zoho/crm.js";
import { submitServiceEnquiry } from "../server/zoho/service.js";
import { submitDeskEnquiry } from "../server/zoho/desk.js";
import { createEnquiryHandler } from "../functions/api/enquiries.js";
import { EnquiryGuard } from "../workers/enquiry-guard/worker.js";
import { privateHash } from "../server/zoho/protection.js";
import { createVerifiedSubmission } from "../src/lib/website/enquiry-contract.js";
import { submitVerifiedEnquiry } from "../src/services/website/enquiries.service.js";

const NOW = new Date("2026-11-06T22:00:00Z"); // Already Saturday in Dubai.
const noop = () => {};
const envFor = () => ({
  ZOHO_CLIENT_ID: "synthetic-client-id-" + crypto.randomUUID(), ZOHO_CLIENT_SECRET: "synthetic-client-secret", ZOHO_REFRESH_TOKEN: "synthetic-refresh-token",
  ZOHO_ENABLE_CRM_LEADS: "true", ZOHO_WORKING_WEEKDAYS: "1,2,3,4,5",
  ENQUIRY_CONSENT_TEXT_AR: "Synthetic Arabic test consent, not production policy.", ENQUIRY_CONSENT_VERSION: "approved-test-v1", ENQUIRY_CONSENT_TEXT: "Synthetic test consent, not production policy.",
  ENQUIRY_ALLOWED_ORIGINS: "https://autoflow.example", ENQUIRY_TURNSTILE_ACTION: "autoflow-enquiry",
  TURNSTILE_SECRET_KEY: "synthetic-turnstile-secret",
  ENQUIRY_GUARD_SECRET: "synthetic-guard-secret-never-use-in-production",
});
const packet = (kind = "vehicle", overrides = {}) => ({
  version: 2, idempotencyKey: crypto.randomUUID(), kind, locale: "en", vehicleReference: "",
  values: {
    firstName: "Demo", lastName: "Reviewer", mobile: "+96891234567", email: "review@example.invalid",
    brand: "Toyota", model: "Land Cruiser 300", condition: "New", branch: "Muscat - Al Khuwair",
    message: "Synthetic enquiry only.", paymentMethod: "Bank Finance", contactMethod: "WhatsApp",
    preferredDate: "2099-11-06", preferredTime: "09:30", licenceConfirmed: true,
    hasTradeIn: true, tradeInDetails: "Illustrative trade-in details.",
    serviceType: "Periodic Maintenance", registration: "Synthetic registration", subject: "Support question", ticketCategory: "Complaint",
  },
  consent: true, consentVersion: "approved-test-v1", turnstileToken: "synthetic-turnstile-token",
  context: { pageUrl: "https://autoflow.example/en/vehicles/?tracking=discard#discard", utmSource: "test" },
  ...overrides,
});
const parse = (p) => parsePhaseARequest(p, { now: NOW, origin: "https://autoflow.example" });
const oauthResponse = (token = "synthetic-access-token") => Response.json({ access_token: token, api_domain: VERIFIED.apiDomain, expires_in: 3600 });
const created = (id = "5413253000099999001") => Response.json({ data: [{ code: "SUCCESS", status: "success", details: { id } }] }, { status: 201 });
const req = (body, ip = "192.0.2.1") => new Request("https://autoflow.example/api/enquiries", {
  method: "POST", headers: { origin: "https://autoflow.example", "content-type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify(body),
});
class Storage {
  constructor() { this.entries = new Map(); this.tail = Promise.resolve(); this.alarmTime = null; }
  async get(key) { return structuredClone(this.entries.get(key)); }
  async put(key, value) { this.entries.set(key, structuredClone(value)); }
  async delete(key) { this.entries.delete(key); }
  async list() { return new Map(this.entries); }
  async getAlarm() { return this.alarmTime; }
  async setAlarm(time) { this.alarmTime = time; }
  transaction(fn) { const result = this.tail.then(() => fn(this)); this.tail = result.catch(noop); return result; }
}
function addGuard(env) {
  const storage = new Storage();
  const guard = new EnquiryGuard({ storage }, env);
  env.ENQUIRY_GUARD = { fetch: (url, options) => guard.fetch(new Request(url, options)) };
  return { storage, guard };
}
function fetcher(calls, override) {
  return async (url, options = {}) => {
    const target = String(url); calls.push({ url: target, ...options });
    if (override) { const response = await override(target, options); if (response) return response; }
    if (target.endsWith("/siteverify")) return Response.json({ success: true, hostname: "autoflow.example", action: "autoflow-enquiry" });
    if (target.endsWith("/oauth/v2/token")) return oauthResponse();
    if (target.includes("/Leads")) return created();
    throw new Error("Unexpected mocked network call");
  };
}
const handlerFor = (fetchImpl, logs = []) => createEnquiryHandler({ fetchImpl, now: () => NOW, sleep: async () => {}, logger: { warn: (item) => logs.push(item) } });

test("OAuth refresh is single-flight, cached and uses form-encoded secret POST bodies", async () => {
  const env = envFor(), calls = [];
  const options = { fetchImpl: fetcher(calls), now: () => NOW.getTime() };
  const tokens = await Promise.all(Array.from({ length: 8 }, () => getAccessToken(env, options)));
  assert.equal(calls.length, 1); assert.equal(new Set(tokens.map((x) => x.accessToken)).size, 1);
  assert.equal(calls[0].url, "https://accounts.zoho.com/oauth/v2/token");
  assert.ok(!calls[0].url.includes(env.ZOHO_CLIENT_SECRET));
  assert.equal(calls[0].body.get("grant_type"), "refresh_token");
  assert.equal(calls[0].redirect, "error");
  await getAccessToken({ ...env }, options); assert.equal(calls.length, 1); // New request env object, same private credentials.
  await getAccessToken(env, { ...options, now: () => NOW.getTime() + 3600000 }); assert.equal(calls.length, 2);
});

test("OAuth validates api_domain, fails without credentials and never follows foreign origins", async () => {
  await assert.rejects(getAccessToken({}), (e) => e.code === "integration_unconfigured");
  const env = envFor();
  await assert.rejects(getAccessToken(env, { fetchImpl: async () => Response.json({ access_token: "synthetic", api_domain: "https://foreign.example", expires_in: 3600 }) }), (e) => e.code === "unavailable");
  await assert.rejects(getAccessToken({ ...envFor(), ZOHO_ACCOUNTS_URL: "https://foreign.example" }));
});

test("optional KV caches only short-lived access tokens and invalidation bypasses stale KV on delete failure", async () => {
  const env = envFor(); let cached; const stored = [];
  env.ZOHO_TOKEN_CACHE = { get: async () => cached, put: async (key, value) => { stored.push({ key, value }); cached = JSON.parse(value); }, delete: async () => { throw new Error("cache offline"); } };
  let refreshes = 0;
  const options = { fetchImpl: async () => oauthResponse("synthetic-" + ++refreshes), now: () => NOW.getTime() };
  const first = await getAccessToken(env, options);
  assert.ok(!JSON.stringify(stored).includes(env.ZOHO_REFRESH_TOKEN));
  assert.ok(!JSON.stringify(stored).includes(env.ZOHO_CLIENT_SECRET));
  await invalidateAccessToken(env, first.accessToken);
  const second = await getAccessToken(env, options);
  assert.notEqual(second.accessToken, first.accessToken); assert.equal(refreshes, 2);
});

test("verified picklists and mandatory names reject legacy values, foreign fields and fake IDs", () => {
  assert.equal(BRANCHES.length, 12);
  for (const kind of ["vehicle", "quotation", "drive", "trade-in", "service", "support"]) assert.equal(parse(packet(kind)).kind, kind);
  for (const [field, value] of [["firstName", ""], ["lastName", ""], ["mobile", "91234567"], ["email", "x".repeat(101)], ["brand", "Unverified"], ["condition", "new"], ["branch", "discuss"], ["preferredDate", "2026-02-31"], ["licenceConfirmed", false]]) {
    const p = packet("drive"); p.values[field] = value; assert.throws(() => parse(p), (e) => e.code === "invalid", field);
  }
  const foreign = packet(); foreign.values.Layout = VERIFIED.leadsLayout; assert.throws(() => parse(foreign));
  assert.throws(() => parse(packet("Deals")));
  assert.throws(() => parse(packet("drive", { consent: false })));
  const unapproved = packet(); unapproved.context.pageUrl = "https://foreign.example/"; assert.throws(() => parse(unapproved));
  assert.equal(parse(packet()).context.pageUrl, "https://autoflow.example/en/vehicles/");
});

test("all Lead requests use exact AutoFlow fields and workflow triggers; no Quotes/Test_Drives/Deals writes", async () => {
  for (const kind of ["vehicle", "quotation", "drive", "trade-in"]) {
    const env = envFor(), calls = [], p = parse(packet(kind));
    const result = await submitCrmEnquiry(p, env, { client: createZohoClient(env, { fetchImpl: fetcher(calls) }), now: NOW });
    assert.equal(result.confirmed, false);
    const writes = calls.filter((c) => c.url.includes("/crm/"));
    assert.equal(writes.length, 1); assert.equal(writes[0].url, "https://www.zohoapis.com/crm/v8/Leads");
    const payload = JSON.parse(writes[0].body), r = payload.data[0];
    assert.equal(r.Layout.id, "5413253000014418033");
    assert.equal(r.Lead_Source, "Website Enquiry"); assert.equal(r.Lead_Status, "New Enquiry");
    assert.equal(r.Next_Follow_up_Date, "2026-11-09");
    assert.deepEqual(payload.trigger, ["workflow"]);
    assert.equal(r.Industry, undefined); assert.equal(r.Website, undefined); assert.equal(r.Owner, undefined);
    if (kind === "quotation") assert.match(r.Description, /^\[Quotation request\]/);
    if (kind === "drive") assert.match(r.Description, /^\[Test drive request\]/);
    if (kind === "trade-in") { assert.equal(r.Has_Trade_In, true); assert.match(r.Description, /^\[Trade-in request\]/); }
  }
});

test("next working day uses Dubai calendar boundaries and explicitly approved weekdays/holidays", () => {
  assert.throws(() => nextFollowUpDate({}, NOW), (e) => e.code === "integration_unconfigured");
  assert.equal(nextFollowUpDate({ ZOHO_WORKING_WEEKDAYS: "0,1,2,3,4" }, NOW), "2026-11-08");
  assert.equal(nextFollowUpDate({ ZOHO_WORKING_WEEKDAYS: "1,2,3,4,5", ZOHO_HOLIDAYS: "2026-11-09" }, NOW), "2026-11-10");
});

test("client refreshes a rejected token once, then retries authorization without exposing errors", async () => {
  const env = envFor(); let refreshes = 0, writes = 0;
  const client = createZohoClient(env, { fetchImpl: async (url) => {
    if (String(url).includes("/oauth/")) return oauthResponse("synthetic-" + ++refreshes);
    writes++; return writes === 1 ? Response.json({ code: "INVALID_TOKEN" }, { status: 401 }) : created();
  } });
  await client.crm("Leads", { data: buildLead(parse(packet()), env, NOW) });
  assert.equal(refreshes, 2); assert.equal(writes, 2);
});

test("client bounds throttle/read retries, never retries a validation rejection, and blocks arbitrary modules", async () => {
  const env = envFor(); let writes = 0; const sleeps = [];
  const client = createZohoClient(env, { sleep: async (ms) => sleeps.push(ms), fetchImpl: async (url) => {
    if (String(url).includes("/oauth/")) return oauthResponse();
    writes++; return writes < 3 ? new Response("throttled", { status: 429 }) : created();
  } });
  await client.crm("Leads", { data: buildLead(parse(packet()), envFor(), NOW) }); assert.equal(writes, 3); assert.equal(sleeps.length, 2);
  await assert.rejects(client.crm("Deals", { data: buildLead(parse(packet()), envFor(), NOW) }), (e) => e.code === "integration_unconfigured");
  let rejected = 0;
  const bad = createZohoClient(envFor(), { fetchImpl: async (url) => {
    if (String(url).includes("/oauth/")) return oauthResponse();
    rejected++; return Response.json({ data: [{ code: "INVALID_DATA", details: { api_name: "Preferred_Branch" } }] }, { status: 400 });
  } });
  await assert.rejects(bad.crm("Leads", { data: buildLead(parse(packet()), envFor(), NOW) }), (e) => e.code === "provider_validation" && e.field === "Preferred_Branch");
  assert.equal(rejected, 1);
});

test("ambiguous create failures are not blindly retried", async () => {
  for (const mode of ["network", "server"]) {
    let writes = 0;
    const client = createZohoClient(envFor(), { sleep: async () => {}, fetchImpl: async (url) => {
      if (String(url).includes("/oauth/")) return oauthResponse();
      writes++; if (mode === "network") throw new Error("synthetic private provider detail");
      return Response.json({ error: "synthetic internal detail" }, { status: 500 });
    } });
    await assert.rejects(client.crm("Leads", { data: buildLead(parse(packet()), envFor(), NOW) }), (e) => e.uncertain === true && e.code === "result_unknown" && !e.message.includes("private"));
    assert.equal(writes, 1);
  }
});

test("service searches email then phone, creates only a permitted Contact and Requested appointment", async () => {
  const env = { ...envFor(), ZOHO_SERVICE_MODE: "appointment" }, calls = [];
  const client = createZohoClient(env, { fetchImpl: fetcher(calls, async (url) => {
    if (url.includes("/Contacts/search")) return new Response(null, { status: 204 });
    if (url.endsWith("/Contacts")) return created("5413253000099999002");
    if (url.endsWith("/Service_Appointments")) return created("5413253000099999003");
  }) });
  const result = await submitServiceEnquiry(parse(packet("service")), env, { client, now: NOW });
  assert.equal(result.confirmed, false);
  const searches = calls.filter((c) => c.url.includes("/Contacts/search"));
  assert.deepEqual(searches.map((c) => c.url), [
    "https://www.zohoapis.com/crm/v8/Contacts/search?email=review%40example.invalid",
    "https://www.zohoapis.com/crm/v8/Contacts/search?phone=%2B96891234567",
  ]);
  for (const search of searches) {
    assert.equal(search.method, "GET"); assert.equal(search.body, undefined);
    assert.equal(search.headers.authorization, "Zoho-oauthtoken synthetic-access-token");
  }
  for (const write of calls.filter((c) => c.url.endsWith("/Contacts") || c.url.endsWith("/Service_Appointments"))) {
    assert.equal(JSON.parse(write.body).lar_id, undefined);
  }
  const contact = JSON.parse(calls.find((c) => c.url.endsWith("/Contacts")).body).data[0];
  assert.equal(contact.Layout.id, "5413253000000091033");
  assert.equal(contact.Primary_Contact_First_Name, "Demo"); assert.equal(contact.First_Name, undefined); assert.equal(contact.Lead_Source, undefined);
  const appt = JSON.parse(calls.find((c) => c.url.endsWith("/Service_Appointments")).body).data[0];
  assert.equal(appt.Layout.id, "5413253000014444017"); assert.equal(appt.Appointment_Status, "Requested");
  assert.equal(appt.Customer.id, "5413253000099999002"); assert.equal(appt.Vehicle, undefined); assert.equal(appt.Preferred_Service_Advisor, undefined);
});

test("service reuses an unambiguous contact and refuses ambiguous shared-org matches", async () => {
  const env = { ...envFor(), ZOHO_SERVICE_MODE: "appointment" }; const calls = [];
  const client = { crm: async (name) => { calls.push(name); return name === "Contacts/search" ? { data: [{ id: "5413253000099999002" }] } : { data: [{ details: { id: "5413253000099999003" } }] }; } };
  await submitServiceEnquiry(parse(packet("service")), env, { client, now: NOW });
  assert.deepEqual(calls, ["Contacts/search", "Service_Appointments"]);
  await assert.rejects(submitServiceEnquiry(parse(packet("service")), env, { client: { crm: async () => ({ data: [{ id: "1" }, { id: "2" }] }) }, now: NOW }), (e) => e.code === "contact_ambiguous");
});

test("service and support decisions remain disabled unless explicitly configured", async () => {
  await assert.rejects(submitServiceEnquiry(parse(packet("service")), { ...envFor(), ZOHO_SERVICE_MODE: "disabled" }), (e) => e.code === "integration_unconfigured");
  await assert.rejects(submitDeskEnquiry(parse(packet("support")), envFor()), (e) => e.code === "integration_unconfigured");
  const p = packet("service"); p.values.preferredTime = "09:15"; assert.throws(() => parse(p));
  const env = { ...envFor(), ZOHO_SERVICE_MODE: "lead" };
  const r = await submitServiceEnquiry(parse(packet("service")), env, { client: { crm: async (module, { data }) => { assert.equal(module, "Leads"); assert.equal(data.data[0].Interested_Model, "Service booking"); return { data: [{ details: { id: "5413253000099999001" } }] }; } }, now: NOW });
  assert.equal(r.confirmed, false);
});

test("Desk uses only the verified AutoFlow department/org and escapes user HTML", async () => {
  const env = { ...envFor(), ZOHO_SUPPORT_MODE: "desk" }, calls = [];
  const p = packet("support"); p.values.message = "<script>untrusted</script>";
  const client = createZohoClient(env, { fetchImpl: fetcher(calls, async (url) => url.endsWith("/tickets") ? Response.json({ id: "759804000009999001", ticketNumber: "not-public" }) : undefined) });
  await submitDeskEnquiry(parse(p), env, { client, now: NOW });
  const call = calls.find((c) => c.url.endsWith("/tickets")), body = JSON.parse(call.body);
  assert.equal(call.headers.orgId, "785172113"); assert.equal(body.departmentId, "759804000005916029");
  assert.equal(body.channel, "Web"); assert.equal(body.status, "Open"); assert.equal(body.priority, "Medium");
  assert.equal(body.assigneeId, undefined); assert.equal(body.category, undefined); assert.equal(body.cf_policy_number, undefined);
  assert.ok(!body.description.includes("<script>")); assert.ok(body.description.includes("&lt;script&gt;"));
});

test("Pages endpoint applies Turnstile and atomic retry protection without returning internal IDs", async () => {
  const env = envFor(); const { storage } = addGuard(env); const calls = [], logs = [];
  const handle = handlerFor(fetcher(calls), logs), p = packet("quotation");
  const first = await handle({ request: req(p), env }); assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { ok: true, delivered: true, confirmed: false });
  const repeated = await handle({ request: req({ ...p, turnstileToken: "fresh-synthetic-token" }), env });
  assert.equal(repeated.status, 200); assert.equal(calls.filter((c) => c.url.includes("/Leads")).length, 1);
  assert.equal(calls.filter((c) => c.url.endsWith("/siteverify")).length, 1);
  const metadata = JSON.stringify([...storage.entries]);
  assert.ok(!metadata.includes(p.values.email)); assert.ok(!metadata.includes(p.values.mobile)); assert.ok(!metadata.includes(p.values.message));
  assert.deepEqual(logs, []);
  const other = packet("quotation"); other.values.email = p.values.email;
  assert.equal((await handle({ request: req(other), env })).status, 200);
  assert.equal(calls.filter((c) => c.url.includes("/Leads")).length, 2); // Distinct enquiries always insert.
});

test("concurrent copies of the same submission can create at most one Lead", async () => {
  const env = envFor(); addGuard(env); const calls = [], handle = handlerFor(fetcher(calls)), p = packet();
  const responses = await Promise.all([handle({ request: req(p), env }), handle({ request: req(p), env })]);
  assert.ok(responses.some((r) => r.status === 200)); assert.ok(responses.every((r) => [200, 409].includes(r.status)));
  assert.equal(calls.filter((c) => c.url.includes("/Leads")).length, 1);
});

test("guard rate-limits per hashed IP and refuses nonce reuse with a different payload", async () => {
  const env = envFor(); addGuard(env); const handle = handlerFor(fetcher([])), p = packet();
  assert.equal((await handle({ request: req(p), env })).status, 200);
  const changed = structuredClone(p); changed.values.model = "Changed model";
  assert.equal((await handle({ request: req(changed), env })).status, 409);
  for (let i = 0; i < 3; i++) assert.equal((await handle({ request: req(packet()), env })).status, 200);
  assert.equal((await handle({ request: req(packet()), env })).status, 429);
});

test("unresolved write outcomes block subsequent retries without another Zoho create", async () => {
  const env = envFor(); addGuard(env); const calls = [];
  const handle = handlerFor(fetcher(calls, async (url) => url.includes("/Leads") ? new Response("ambiguous", { status: 500 }) : undefined)), p = packet();
  const first = await handle({ request: req(p), env }); assert.equal(first.status, 503); assert.equal((await first.json()).code, "result_unknown");
  assert.equal((await handle({ request: req(p), env })).status, 409); assert.equal(calls.filter((c) => c.url.includes("/Leads")).length, 1);
});

test("wrong Turnstile hostname/action cannot reach OAuth or a record API", async () => {
  for (const bad of [{ hostname: "other.example" }, { action: "wrong-action" }, { success: false }]) {
    const env = envFor(); addGuard(env); const calls = [];
    const handle = handlerFor(fetcher(calls, async (url) => url.endsWith("/siteverify") ? Response.json({ success: true, hostname: "autoflow.example", action: "autoflow-enquiry", ...bad }) : undefined));
    assert.equal((await handle({ request: req(packet()), env })).status, 403);
    assert.equal(calls.length, 1); assert.ok(calls[0].url.endsWith("/siteverify"));
  }
});

test("missing approvals, secrets, guard, calendar or wrong layout never cause network writes", async () => {
  for (const change of [{ ZOHO_ENABLE_CRM_LEADS: "" }, { ZOHO_CLIENT_SECRET: "" }, { ENQUIRY_CONSENT_TEXT: "" }, { ZOHO_WORKING_WEEKDAYS: "" }, { ZOHO_CRM_LEADS_LAYOUT_ID: "999" }, { ENQUIRY_GUARD: undefined }]) {
    const env = envFor(); addGuard(env); Object.assign(env, change); const calls = [];
    const response = await handlerFor(fetcher(calls))({ request: req(packet()), env });
    assert.equal(response.status, 503); assert.equal(calls.length, 0);
  }
  const env = envFor(); addGuard(env);
  assert.equal((await handlerFor(fetcher([]))({ request: req(packet("support")), env })).status, 503);
});

test("version-2 browser transport sends verified user values and never imports server secrets", async () => {
  const p = packet("trade-in"); const envelope = createVerifiedSubmission(p, { idempotencyKey: p.idempotencyKey });
  assert.equal(envelope.version, 2); assert.equal(envelope.kind, "trade-in"); assert.equal(envelope.values.firstName, "Demo");
  let outgoing;
  const result = await submitVerifiedEnquiry(p, { mode: "live", idempotencyKey: p.idempotencyKey, fetchImpl: async (url, opts) => { outgoing = { url, ...opts }; return Response.json({ ok: true, delivered: true, confirmed: false }); } });
  assert.equal(JSON.parse(outgoing.body).version, 2); assert.equal(outgoing.url, "/api/enquiries"); assert.equal(result.confirmed, false);
  assert.ok(!readFileSync("src/services/website/enquiries.service.js", "utf8").includes("server/zoho"));
  assert.ok(!readFileSync("src/lib/website/enquiry-contract.js", "utf8").includes("ZOHO_CLIENT_SECRET"));
});

test("metadata hashing and payload builders never accept shared-demo/staff-only fields", async () => {
  assert.match(await privateHash(envFor(), "synthetic data"), /^[a-f0-9]{64}$/);
  const env = envFor(), p = parse(packet());
  const lead = buildLead(p, env, NOW).data[0];
  assert.equal(lead.Currency, undefined); assert.equal(lead.Lost_Reason, undefined); assert.equal(lead.Visitor_Score, undefined);
  const contact = buildContact(p).data[0]; assert.equal(contact.Lease_Start_Date, undefined);
  assert.equal(buildAppointment(parse(packet("service")), env, "5413253000099999002", NOW).data[0].Appointment_Status, "Requested");
  assert.equal(buildDeskTicket(parse(packet("support")), env, NOW).assigneeId, undefined);
});

test("API boundary refuses foreign layouts, staff fields and broad contact reads before OAuth", async () => {
  const env = { ...envFor(), ZOHO_SUPPORT_MODE: "desk" }; const calls = [];
  const client = createZohoClient(env, { fetchImpl: fetcher(calls) });
  for (const change of [{ Layout: { id: "5413253000000091033" } }, { Owner: { id: "999" } }, { Industry: "Other demo" }, { Lead_Source: "Chat" }]) {
    const body = buildLead(parse(packet()), env, NOW); Object.assign(body.data[0], change);
    await assert.rejects(client.crm("Leads", { data: body }), (e) => e.code === "integration_unconfigured");
  }
  const ticket = buildDeskTicket(parse(packet("support")), env, NOW); ticket.departmentId = "999";
  await assert.rejects(client.desk("tickets", { data: ticket }), (e) => e.code === "integration_unconfigured");
  await assert.rejects(client.crm("Contacts/search", { method: "GET" }), (e) => e.code === "integration_unconfigured");
  assert.equal(calls.length, 0);
});

test("OAuth retry limits and rejected authorization cannot create an unbounded refresh loop", async () => {
  let attempts = 0;
  await assert.rejects(getAccessToken(envFor(), { sleep: async () => {}, fetchImpl: async () => { attempts++; return new Response("throttled", { status: 429 }); } }), (e) => e.code === "unavailable");
  assert.equal(attempts, 3);
  let auth = 0, writes = 0;
  const client = createZohoClient(envFor(), { fetchImpl: async (url) => {
    if (String(url).includes("/oauth/")) { auth++; return oauthResponse("synthetic-token-" + auth); }
    writes++; return Response.json({ code: "INVALID_TOKEN" }, { status: 401 });
  } });
  await assert.rejects(client.crm("Leads", { data: buildLead(parse(packet()), envFor(), NOW) }));
  assert.equal(auth, 2); assert.equal(writes, 2);
});

test("service reuses a phone match after email misses and never creates a second Contact", async () => {
  const env = { ...envFor(), ZOHO_SERVICE_MODE: "appointment" }; const calls = [];
  const client = { crm: async (module, options) => {
    calls.push({ module, options });
    if (module === "Contacts/search") return options.query.email ? null : { data: [{ id: "5413253000099999002" }] };
    return { data: [{ details: { id: "5413253000099999003" } }] };
  } };
  await submitServiceEnquiry(parse(packet("service")), env, { client, now: NOW });
  assert.deepEqual(calls.map((x) => x.module), ["Contacts/search", "Contacts/search", "Service_Appointments"]);
});

test("ambiguous appointment failures cannot repeat an already-created Contact on HTTP retry", async () => {
  const env = { ...envFor(), ZOHO_SERVICE_MODE: "appointment" }; addGuard(env); const calls = [];
  const fetchImpl = fetcher(calls, async (url) => {
    if (url.includes("/Contacts/search")) return new Response(null, { status: 204 });
    if (url.endsWith("/Contacts")) return created("5413253000099999002");
    if (url.endsWith("/Service_Appointments")) return new Response("provider unavailable", { status: 500 });
  });
  const handle = handlerFor(fetchImpl), p = packet("service");
  assert.equal((await handle({ request: req(p), env })).status, 503);
  assert.equal((await handle({ request: req(p), env })).status, 409);
  assert.equal(calls.filter((x) => x.url.endsWith("/Contacts")).length, 1);
  assert.equal(calls.filter((x) => x.url.endsWith("/Service_Appointments")).length, 1);
});

test("canonical retry fingerprints ignore JSON property ordering and refreshed challenge tokens", async () => {
  const env = envFor(); addGuard(env); const calls = [], handle = handlerFor(fetcher(calls)), p = packet();
  assert.equal((await handle({ request: req(p), env })).status, 200);
  p.values = Object.fromEntries(Object.entries(p.values).reverse()); p.turnstileToken = "another-synthetic-token";
  assert.equal((await handle({ request: req(p), env })).status, 200);
  assert.equal(calls.filter((x) => x.url.includes("/Leads")).length, 1);
});

test("provider validation diagnostics never echo secrets or full provider bodies", async () => {
  const env = envFor(); addGuard(env); const calls = [], logs = [];
  const handle = handlerFor(fetcher(calls, async (url) => url.includes("/Leads")
    ? Response.json({ data: [{ code: "INVALID_DATA", status: "error", message: env.ZOHO_CLIENT_SECRET, details: { api_name: "Preferred_Branch", personal: "do-not-log" } }] }, { status: 400 }) : undefined), logs);
  const response = await handle({ request: req(packet()), env }); assert.equal(response.status, 422);
  const body = await response.text(); assert.ok(!body.includes(env.ZOHO_CLIENT_SECRET)); assert.ok(!JSON.stringify(logs).includes("do-not-log"));
  assert.deepEqual(logs, [{ event: "zoho_enquiry_rejected", code: "provider_validation", providerCode: "INVALID_DATA", field: "Preferred_Branch", status: 422 }]);
});

test("verified transport preserves safe retry outcome codes and never reports confirmed bookings", async () => {
  const p = packet();
  for (const [code, expected] of [["result_unknown", "resultUnknown"], ["in_progress", "inProgress"], ["idempotency_conflict", "idempotencyConflict"], ["challenge_failed", "challengeFailed"]]) {
    await assert.rejects(submitVerifiedEnquiry(p, { mode: "live", fetchImpl: async () => Response.json({ code, message: "never-show-this" }, { status: 409 }) }),
      (e) => e.code === expected && !e.message.includes("never-show"));
  }
  const result = await submitVerifiedEnquiry(p, { mode: "live", fetchImpl: async () => Response.json({ ok: true, delivered: true, confirmed: true }) });
  assert.equal(result.confirmed, false);
});

test("the private guard refuses missing or incorrectly typed authentication secrets", async () => {
  for (const secret of [undefined, 123, "too-short"]) {
    const guard = new EnquiryGuard({ storage: new Storage() }, { ENQUIRY_GUARD_SECRET: secret });
    const response = await guard.fetch(new Request("https://guard.internal/claim", { method: "POST", headers: { authorization: "Bearer " + secret }, body: "{}" }));
    assert.equal(response.status, 403);
  }
});

import { verifiedFormFields, verifiedFormOptions, verifiedFormValues, validateVerifiedForm } from "../src/lib/website/verified-forms.js";
import { dictionaries } from "../src/lib/website/dictionaries.js";

for (const locale of ["en", "ar"]) for (const kind of ["contact", "vehicle", "quotation", "drive", "trade-in", "service", "support"]) {
  test("Phase B: " + locale + " " + kind + " browser values reach the correct protected Zoho route", async () => {
    const env = { ...envFor(), ZOHO_SUPPORT_MODE: "desk" }; addGuard(env);
    const p = packet(kind, { locale }); p.values.type = "general";
    const values = verifiedFormValues(p.values, kind);
    assert.deepEqual(validateVerifiedForm(values, kind, locale, "2026-11-06"), {});
    const calls = [];
    const handle = handlerFor(fetcher(calls, async (url) => {
      if (url.includes("/Contacts/search")) return new Response(null, { status: 204 });
      if (url.endsWith("/Contacts")) return created("5413253000099999002");
      if (url.endsWith("/Service_Appointments")) return created("5413253000099999003");
      if (url.endsWith("/tickets")) return Response.json({ id: "759804000009999001" });
    }));
    const result = await submitVerifiedEnquiry({ ...p, values }, { mode: "live", idempotencyKey: p.idempotencyKey,
      fetchImpl: async (url, options) => handle({ request: req(JSON.parse(options.body)), env }) });
    assert.equal(result.delivered, true); assert.equal(result.confirmed, false);
    const writes = calls.filter((c) => c.method === "POST" && (c.url.includes("/crm/v8/") || c.url.endsWith("/tickets")));
    if (kind === "service") {
      assert.equal(writes.length, 2);
      assert.equal(JSON.parse(writes[1].body).data[0].Customer.id, "5413253000099999002");
      // Searches stay 204 throughout the indexing delay; never re-search the new Contact.
      assert.equal(calls.filter((c) => c.url.includes("/Contacts/search")).length, 2);
    } else if (kind === "support") {
      const ticket = JSON.parse(writes[0].body);
      assert.deepEqual(ticket.cf, { cf_af_ticket_category: "Complaint", cf_af_branch: "Muscat - Al Khuwair", cf_af_vehicle_plate_number: "Synthetic registration" });
      assert.equal(ticket.category, undefined); assert.equal(ticket.subCategory, undefined);
    } else {
      assert.equal(new URL(writes[0].url).search, "");
      assert.equal(JSON.parse(writes[0].body).lar_id, VERIFIED.leadAssignmentRule);
      assert.equal(JSON.parse(writes[0].body).data[0].Preferred_Language, locale === "ar" ? "Arabic" : "English");
    }
  });
}

test("Phase B: Arabic option labels always retain exact English API values", () => {
  const en = verifiedFormOptions("en", dictionaries.en), ar = verifiedFormOptions("ar", dictionaries.ar);
  for (const key of Object.keys(en)) assert.deepEqual(ar[key].map((o) => o.value), en[key].map((o) => o.value));
  assert.match(ar.branches[0].label, /\p{Script=Arabic}/u);
  assert.equal(ar.branches[0].value, "Muscat - Al Khuwair");
  assert.equal(ar.categories.length, 12);
  for (const kind of ["contact", "vehicle", "quotation", "drive", "trade-in", "service", "support"]) {
    assert.ok(verifiedFormFields(kind).some((f) => f.key === "firstName"));
    assert.ok(verifiedFormFields(kind).some((f) => f.key === "lastName"));
    assert.ok(!verifiedFormFields(kind).some((f) => f.key === "name"));
  }
});

test("Phase B: assignment overrides and shared Desk custom fields fail before OAuth", async () => {
  let requests = 0;
  const env = { ...envFor(), ZOHO_SUPPORT_MODE: "desk" };
  const client = createZohoClient(env, { fetchImpl: async () => { requests++; throw new Error("must not call"); } });
  for (const mutate of [
    (t) => { t.category = "Complaint"; }, (t) => { t.subCategory = "Other"; },
    (t) => { t.cf.cf_policy_number = "unsafe"; }, (t) => { t.cf.cf_af_branch = "discuss"; },
    (t) => { t.cf.cf_af_ticket_category = "Invented"; },
  ]) {
    const ticket = buildDeskTicket(parse(packet("support")), env, NOW); mutate(ticket);
    await assert.rejects(client.desk("tickets", { data: ticket }), (e) => e.code === "integration_unconfigured");
  }
  const wrong = { ...env, ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID: "999" };
  await assert.rejects(createZohoClient(wrong).crm("Leads", { data: buildLead(parse(packet()), wrong, NOW) }));
  assert.equal(requests, 0);
});

test("Phase B: browser network ambiguity retains a review-required result", async () => {
  await assert.rejects(submitVerifiedEnquiry(packet(), { mode: "live", fetchImpl: async () => { throw new Error("private detail"); } }), (e) => e.code === "resultUnknown" && !e.message.includes("private"));
});

test("Phase B: Lead fallback forms collect every mandatory value explicitly", () => {
  const routes = { serviceMode: "lead", supportMode: "lead" };
  for (const kind of ["service", "support"]) {
    const fields = verifiedFormFields(kind, routes);
    for (const key of ["brand", "model", "condition", "branch"]) assert.ok(fields.find((f) => f.key === key)?.required);
  }
});

test("Phase B: every branch Lead receives the verified assignment rule", async () => {
  for (const branch of BRANCHES) {
    const env = envFor(), calls = [], p = packet(); p.values.branch = branch;
    await submitCrmEnquiry(parse(p), env, { client: createZohoClient(env, { fetchImpl: fetcher(calls) }), now: NOW });
    const write = calls.find((c) => c.url.endsWith("/Leads"));
    assert.equal(new URL(write.url).search, "");
    assert.equal(JSON.parse(write.body).lar_id, "5413253000014544001");
    assert.equal(JSON.parse(write.body).data[0].Preferred_Branch, branch);
  }
});

test("Phase B: missing Arabic consent and disabled Desk cannot trigger provider calls", async () => {
  for (const kind of ["vehicle", "support"]) {
    const env = envFor(); addGuard(env); let calls = 0;
    if (kind === "vehicle") delete env.ENQUIRY_CONSENT_TEXT_AR;
    const response = await handlerFor(async () => { calls++; throw new Error("must not call"); })({ request: req(packet(kind, { locale: "ar" })), env });
    assert.equal(response.status, 503); assert.equal(calls, 0);
  }
});

test("Phase B: rejected appointment after Contact creation is held for reconciliation", async () => {
  const env = envFor(); addGuard(env); const calls = [];
  const fetchImpl = fetcher(calls, async (url) => {
    if (url.includes("/Contacts/search")) return new Response(null, { status: 204 });
    if (url.endsWith("/Contacts")) return created("5413253000099999002");
    if (url.endsWith("/Service_Appointments")) return Response.json({ data: [{ code: "INVALID_DATA", status: "error", details: { api_name: "Appointment_Time" } }] }, { status: 400 });
  });
  const handle = handlerFor(fetchImpl), p = packet("service");
  const first = await handle({ request: req(p), env });
  assert.equal((await first.json()).code, "result_unknown");
  assert.equal((await handle({ request: req(p), env })).status, 409);
  assert.equal(calls.filter((c) => c.url.endsWith("/Contacts")).length, 1);
});

test("Lead assignment uses the exact JSON envelope and query-free URL for every sales and fallback route", async () => {
  for (const kind of ["contact", "vehicle", "quotation", "drive", "trade-in", "service", "support"]) {
    const env = { ...envFor(), ZOHO_SERVICE_MODE: "lead", ZOHO_SUPPORT_MODE: "lead" };
    const p = parse(packet(kind)), calls = [], input = buildLead(p, env, NOW);
    const original = structuredClone(input);
    const client = createZohoClient(env, { fetchImpl: fetcher(calls) });
    if (kind === "service") await submitServiceEnquiry(p, env, { client, now: NOW });
    else if (kind === "support") await submitDeskEnquiry(p, env, { client, now: NOW });
    else await client.crm("Leads", { data: input });
    const writes = calls.filter((call) => call.url.includes("/crm/v8/"));
    assert.equal(writes.length, 1);
    assert.equal(writes[0].url, "https://www.zohoapis.com/crm/v8/Leads");
    assert.equal(writes[0].method, "POST");
    assert.equal(writes[0].headers["content-type"], "application/json");
    assert.deepEqual(JSON.parse(writes[0].body), { data: original.data, trigger: ["workflow"], lar_id: "5413253000014544001" });
    assert.deepEqual(input, original); // The API boundary must not mutate a caller's payload.
  }
});

test("Lead assignment accepts only the verified body rule and cannot leak to other modules", async () => {
  const env = envFor(), calls = [], client = createZohoClient(env, { fetchImpl: fetcher(calls) });
  for (const lar_id of ["999", null, 5413253000014544001]) {
    await assert.rejects(client.crm("Leads", { data: { ...buildLead(parse(packet()), env, NOW), lar_id } }),
      (error) => error.code === "integration_unconfigured");
  }
  for (const [module, data] of [
    ["Contacts", buildContact(parse(packet("service")))],
    ["Service_Appointments", buildAppointment(parse(packet("service")), env, "5413253000099999002", NOW)],
  ]) {
    await assert.rejects(client.crm(module, { data: { ...data, lar_id: VERIFIED.leadAssignmentRule } }),
      (error) => error.code === "integration_unconfigured");
  }
  assert.equal(calls.length, 0);
  const data = { ...buildLead(parse(packet()), env, NOW), lar_id: VERIFIED.leadAssignmentRule };
  await client.crm("Leads", { data });
  assert.deepEqual(JSON.parse(calls.find((call) => call.url.endsWith("/Leads")).body), data);
});
