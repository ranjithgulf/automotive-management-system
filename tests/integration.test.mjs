import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { enquiryKinds, formFields, validPhone } from "../src/lib/website/forms.js";
import { createSubmission, parseSubmission } from "../src/lib/website/enquiry-contract.js";
import { submitEnquiry, EnquirySubmissionError } from "../src/services/website/enquiries.service.js";
import { onRequest } from "../functions/api/enquiries.js";
import { submitCrmEnquiry } from "../server/zoho/crm.js";
import { submitDeskEnquiry } from "../server/zoho/desk.js";

const values = { name: "Demo Reviewer", email: "review@example.invalid", phone: "+971 50 555 0101", company: "", type: "general", interest: "Vehicle or service to be confirmed", method: "email", category: "general", subject: "Demonstration support question", brand: "Toyota", model: "Camry", registration: "", branch: "discuss", service: "maintenance", date: "2099-11-06", time: "10:30", message: "A synthetic demonstration request only." };
const packet = (kind = "contact") => createSubmission({ ...values, kind, locale: "en" }, { idempotencyKey: "review-retry-key-0001" });
const request = (body, overrides = {}) => new Request("https://autoflow.example/api/enquiries", { method: "POST", headers: { origin: "https://autoflow.example", "content-type": "application/json", ...overrides.headers }, body: typeof body === "string" ? body : JSON.stringify(body), ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "headers")) });

test("all six request kinds use validated allowlists rather than Zoho field names", () => {
  for (const kind of enquiryKinds) {
    const body = packet(kind);
    assert.ok(parseSubmission(body, "2026-11-05"), kind);
    assert.deepEqual(Object.keys(body.values), formFields(kind).map((field) => field.key));
    assert.equal(body.idempotencyKey, "review-retry-key-0001");
    assert.equal(body.values.ZOHO_CLIENT_SECRET, undefined);
  }
  assert.equal(parseSubmission({ ...packet(), kind: "unknown" }), null);
  assert.equal(parseSubmission({ ...packet(), locale: "xx" }), null);
  assert.equal(parseSubmission({ ...packet(), idempotencyKey: "x" }), null);
  assert.equal(parseSubmission({ ...packet(), secret: "not-a-real-secret" }), null);
  assert.equal(parseSubmission({ ...packet(), values: { ...packet().values, unexpected: "field" } }), null);
  assert.equal(parseSubmission({ ...packet(), values: { ...packet().values, name: { value: "invalid" } } }), null);
});

test("GCC phone formats and Arabic digits enforce national number lengths", () => {
  for (const phone of ["+971 50 555 0101", "+968 9123 4567", "+974 5123 4567", "+966 50 123 4567", "+965 5123 4567", "+973 3123 4567", "+\u0669\u0667\u0661 \u0665\u0660 \u0665\u0665\u0665 \u0660\u0661\u0660\u0661", "+44 20 7946 0123"]) assert.equal(validPhone(phone), true, phone);
  for (const phone of ["-------", "(((((((", "+971 12", "+968 123456789", "+00000000", "abc", "12"]) assert.equal(validPhone(phone), false, phone);
});

test("Pages Function fails closed for every valid form without touching Zoho", async () => {
  for (const kind of enquiryKinds) {
    const response = await onRequest({ request: request(packet(kind)), env: {} });
    assert.equal(response.status, 503, kind);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: false, code: "integration_unconfigured", delivered: false, confirmed: false });
  }
  await assert.rejects(submitCrmEnquiry(packet(), {}), (error) => error.code === "integration_unconfigured");
  await assert.rejects(submitDeskEnquiry(packet("support"), {}), (error) => error.code === "integration_unconfigured");
});

test("Pages Function rejects cross-origin, malformed, oversized and invalid submissions", async () => {
  assert.equal((await onRequest({ request: new Request("https://autoflow.example/api/enquiries") })).status, 405);
  assert.equal((await onRequest({ request: request(packet(), { headers: { origin: "https://other.example" } }) })).status, 403);
  assert.equal((await onRequest({ request: request(packet(), { headers: { "sec-fetch-site": "cross-site" } }) })).status, 403);
  assert.equal((await onRequest({ request: request(packet(), { headers: { "content-type": "text/plain" } }) })).status, 415);
  assert.equal((await onRequest({ request: request("{") })).status, 400);
  assert.equal((await onRequest({ request: request({ ...packet(), values: {} }) })).status, 400);
  assert.equal((await onRequest({ request: request("x".repeat(8193)) })).status, 413);
  assert.equal((await onRequest({ request: request(packet(), { headers: { "content-length": "9000" } }) })).status, 413);
});

test("browser transport does not leak errors or mistake unavailable services for delivery", async () => {
  for (const status of [400, 403, 404, 429, 500, 503]) {
    await assert.rejects(submitEnquiry({ ...values, kind: "contact" }, { mode: "live", fetchImpl: async () => new Response("internal provider detail", { status }) }), (error) => error instanceof EnquirySubmissionError && error.code === (status === 429 ? "rateLimited" : "unavailable") && !error.message.includes("provider"));
  }
  await assert.rejects(submitEnquiry(values, { mode: "live", fetchImpl: async () => { throw new Error("private connection detail"); } }), (error) => error.code === "unavailable" && !error.message.includes("connection"));
  await assert.rejects(submitEnquiry(values, { mode: "live", fetchImpl: async () => Response.json({ ok: true, delivered: false }) }), (error) => error.code === "unavailable");
  await assert.rejects(submitEnquiry(values, { mode: "live", fetchImpl: async () => new Response("not-json") }), (error) => error.code === "unavailable");
});

test("live contract uses same-origin POST and preserves the supplied retry key", async () => {
  let outgoing;
  const result = await submitEnquiry({ ...values, kind: "quotation", locale: "ar" }, {
    mode: "live", idempotencyKey: "stable-retry-key-0001",
    fetchImpl: async (url, options) => { outgoing = { url, ...options }; return Response.json({ ok: true, delivered: true, confirmed: false }); },
  });
  assert.equal(outgoing.url, "/api/enquiries");
  assert.equal(outgoing.method, "POST");
  assert.equal(outgoing.credentials, "same-origin");
  assert.equal(JSON.parse(outgoing.body).idempotencyKey, "stable-retry-key-0001");
  assert.deepEqual(result, { mode: "live", delivered: true, confirmed: false });
});

test("the real unconfigured function response produces a safe browser transport failure", async () => {
  await assert.rejects(submitEnquiry({ ...values, kind: "support" }, {
    mode: "live", fetchImpl: async (url, options) => onRequest({ request: request(options.body), env: {} }),
  }), (error) => error.code === "unavailable");
});

test("deployment stays static, examples are empty and local secrets/generated files stay ignored", () => {
  assert.match(readFileSync("next.config.mjs", "utf8"), /output: "export"/);
  assert.equal(readFileSync(".node-version", "utf8").trim(), "24");
  const routes = JSON.parse(readFileSync("public/_routes.json", "utf8"));
  assert.deepEqual(routes.include, ["/api/enquiries"]);
  for (const line of readFileSync(".env.example", "utf8").split("\n").filter((line) => /^[A-Z_]+=/.test(line))) assert.match(line, /^[A-Z_]+=$/);
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n");
  assert.ok(!tracked.some((file) => /^(\.env$|\.env\.local$|\.dev\.vars|\.next\/|out\/|node_modules\/|\.wrangler\/)/.test(file)));
  for (const file of [".env", ".env.local", ".dev.vars", ".dev.vars.production", ".wrangler/state/example", "workers/enquiry-guard/.wrangler/state/example", ".next/cache/example", "out/index.html"]) assert.equal(execFileSync("git", ["check-ignore", file], { encoding: "utf8" }).trim(), file);
});
