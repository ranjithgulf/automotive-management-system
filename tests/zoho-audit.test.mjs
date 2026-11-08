import test from "node:test";
import assert from "node:assert/strict";
import { submitVerifiedEnquiry } from "../src/services/website/enquiries.service.js";
import { parsePhaseARequest } from "../server/zoho/validation.js";
import { buildLead, buildContact, buildAppointment, buildDeskTicket } from "../server/zoho/mappings.js";

const input = () => ({
  kind: "contact", locale: "en", vehicleReference: "",
  values: { firstName: "Integration", lastName: "Reviewer", mobile: "+12025550147", brand: "Toyota", model: "Review request", condition: "New", branch: "Muscat - Al Khuwair", message: "Synthetic protocol verification." },
  consent: true, consentVersion: "qa-only-v1", turnstileToken: "mock-challenge", context: {},
});

test("audit: an unrecognised gateway failure cannot authorize a fresh submission", async () => {
  for (const status of [500, 502, 503, 504]) {
    await assert.rejects(submitVerifiedEnquiry(input(), { mode: "live", idempotencyKey: "audit-stable-request-key", fetchImpl: async () => new Response("<html>Gateway failure</html>", { status }) }), (error) => error.code === "resultUnknown");
  }
});

test("audit: unknown JSON server failures remain ambiguous but explicit preflight errors are recoverable", async () => {
  await assert.rejects(submitVerifiedEnquiry(input(), { mode: "live", fetchImpl: async () => Response.json({ ok: false, code: "unexpected_gateway_failure" }, { status: 503 }) }), (error) => error.code === "resultUnknown");
  for (const code of ["integration_unconfigured", "unavailable"]) {
    await assert.rejects(submitVerifiedEnquiry(input(), { mode: "live", fetchImpl: async () => Response.json({ ok: false, code }, { status: 503 }) }), (error) => error.code === "unavailable");
  }
});

test("audit: Arabic customer values survive validation and every Zoho mapping", () => {
  const p = { ...input(), version: 2, kind: "vehicle", locale: "ar", idempotencyKey: "audit-arabic-request-key" };
  p.values = { ...p.values, firstName: "مريم", lastName: "المراجعة", message: "طلب مراجعة تكامل باستخدام بيانات توضيحية", mobile: "+٩٦٨٩١٢٣٤٥٦٧", subject: "مراجعة الدعم", ticketCategory: "Feedback", serviceType: "Diagnostics", preferredDate: "2099-11-09", preferredTime: "09:30" };
  const packet = parsePhaseARequest(p, { origin: "https://autoflow.example", now: new Date("2026-11-08T08:00:00Z") });
  const env = { ZOHO_WORKING_WEEKDAYS: "1,2,3,4,5", ENQUIRY_CONSENT_TEXT_AR: "نص توضيحي للاختبار المحلي فقط" };
  const lead = buildLead(packet, env).data[0];
  assert.equal(lead.First_Name, p.values.firstName); assert.equal(lead.Last_Name, p.values.lastName);
  assert.equal(lead.Mobile, "+96891234567"); assert.equal(lead.Preferred_Language, "Arabic");
  assert.ok(lead.Description.includes(p.values.message)); assert.equal(lead.Preferred_Branch, "Muscat - Al Khuwair");
  const contact = buildContact(packet).data[0]; assert.equal(contact.Primary_Contact_First_Name, p.values.firstName); assert.equal(contact.First_Name, undefined);
  const appointment = buildAppointment({ ...packet, kind: "service" }, env, "5413253000099999002").data[0]; assert.equal(appointment.Customer_Complaint_Requested_Work, p.values.message);
  const ticket = buildDeskTicket({ ...packet, kind: "support" }, env); assert.equal(ticket.contact.firstName, p.values.firstName); assert.ok(ticket.description.includes(p.values.message));
});

import { verifyTurnstile } from "../server/zoho/protection.js";

test("audit: Turnstile credential and provider failures are not reported as visitor mistakes", async () => {
  for (const code of ["missing-input-secret", "invalid-input-secret", "internal-error"]) {
    await assert.rejects(verifyTurnstile({ turnstileToken: "mock-token" }, { TURNSTILE_SECRET_KEY: "synthetic-server-secret", ENQUIRY_TURNSTILE_ACTION: "qa" }, {
      origin: "https://autoflow.example", ip: "192.0.2.1",
      fetchImpl: async () => Response.json({ success: false, "error-codes": [code] }),
    }), (error) => error.code === (code === "internal-error" ? "unavailable" : "integration_unconfigured") && error.status === 503);
  }
});

test("audit: invalid and expired Turnstile challenges fail closed", async () => {
  for (const code of ["invalid-input-response", "timeout-or-duplicate"]) {
    await assert.rejects(verifyTurnstile({ turnstileToken: "mock-token" }, { TURNSTILE_SECRET_KEY: "synthetic-server-secret", ENQUIRY_TURNSTILE_ACTION: "qa" }, {
      origin: "https://autoflow.example", ip: "192.0.2.1",
      fetchImpl: async () => Response.json({ success: false, "error-codes": [code] }),
    }), (error) => error.code === "challenge_failed" && error.status === 403);
  }
});
