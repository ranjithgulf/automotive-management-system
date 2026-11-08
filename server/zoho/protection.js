import { ZohoError, unconfigured } from "./errors.js";
import { oauthSettings } from "./oauth.js";
import { buildLead } from "./mappings.js";
import { serviceMode, VERIFIED, checkedSetting, LEAD_KINDS } from "./verified.js";

export function featureRoute(packet, env, now = new Date()) {
  let route;
  if (LEAD_KINDS.includes(packet.kind)) {
    if (env.ZOHO_ENABLE_CRM_LEADS !== "true") throw unconfigured();
    route = "lead";
  } else if (packet.kind === "service") {
    if (!["lead", "appointment"].includes(serviceMode(env))) throw unconfigured();
    route = serviceMode(env);
  } else {
    if (!["lead", "desk"].includes(env.ZOHO_SUPPORT_MODE)) throw unconfigured();
    route = env.ZOHO_SUPPORT_MODE;
  }
  oauthSettings(env);
  checkedSetting(env, "ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID", VERIFIED.leadAssignmentRule);
  checkedSetting(env, "ZOHO_CRM_API_VERSION", "v8");
  checkedSetting(env, "ZOHO_CRM_LEADS_LAYOUT_ID", VERIFIED.leadsLayout);
  checkedSetting(env, "ZOHO_CRM_SERVICE_APPOINTMENTS_LAYOUT_ID", VERIFIED.appointmentsLayout);
  checkedSetting(env, "ZOHO_DESK_ORG_ID", VERIFIED.deskOrg);
  checkedSetting(env, "ZOHO_DESK_DEPARTMENT_ID", VERIFIED.deskDepartment);
  checkedSetting(env, "ZOHO_DESK_API_BASE", VERIFIED.deskBase);
  if (route === "desk" && (!packet.values.ticketCategory || !packet.values.branch)) throw new ZohoError("invalid", { status: 422 });
  const consentText = packet.locale === "ar" ? env.ENQUIRY_CONSENT_TEXT_AR : env.ENQUIRY_CONSENT_TEXT;
  if (typeof consentText !== "string" || !consentText.trim() || consentText.length > 2000
    || !env.ENQUIRY_CONSENT_VERSION || env.ENQUIRY_CONSENT_VERSION !== packet.consentVersion) throw unconfigured();
  if (route === "lead") {
    if (env.ZOHO_ENABLE_CRM_LEADS !== "true") throw unconfigured();
    // Validate all required fallback Lead fields and the business calendar
    // before contacting Turnstile, OAuth, Contacts or any record API.
    if (packet.kind === "support") for (const key of ["brand", "model", "condition", "branch"]) if (!packet.values[key]) throw new ZohoError("invalid", { status: 422, field: key });
    buildLead(packet, env, now);
  }
  return route;
}
export function approvedOrigins(env) {
  const origins = String(env.ENQUIRY_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origins.length) throw unconfigured();
  for (const value of origins) {
    let url; try { url = new URL(value); } catch { throw unconfigured(); }
    if (url.protocol !== "https:" || url.origin !== value || url.username || url.password) throw unconfigured();
  }
  return origins;
}
export function assertProtection(env) {
  if (!env.ENQUIRY_GUARD?.fetch || typeof env.ENQUIRY_GUARD_SECRET !== "string" || env.ENQUIRY_GUARD_SECRET.length < 32
    || !env.TURNSTILE_SECRET_KEY || !/^[a-zA-Z0-9_-]{1,32}$/.test(env.ENQUIRY_TURNSTILE_ACTION || "")) throw unconfigured();
}
export async function privateHash(env, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.ENQUIRY_GUARD_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hash = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
export async function guardCall(env, action, body) {
  let response;
  try {
    response = await env.ENQUIRY_GUARD.fetch("https://enquiry-guard.internal/" + action, {
      method: "POST", headers: { authorization: "Bearer " + env.ENQUIRY_GUARD_SECRET, "content-type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
    });
  } catch { throw new ZohoError("unavailable"); }
  let result; try { result = await response.json(); } catch { throw new ZohoError("unavailable"); }
  if (!response.ok) {
    const code = ["rateLimited", "in_progress", "result_unknown", "idempotency_conflict"].includes(result.code) ? result.code : "unavailable";
    throw new ZohoError(code, { status: response.status === 429 ? 429 : response.status === 409 ? 409 : 503 });
  }
  return result;
}
export async function verifyTurnstile(packet, env, { origin, ip, fetchImpl = fetch }) {
  let response, result;
  try {
    response = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", redirect: "error", headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: packet.turnstileToken, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    result = await response.json();
  } catch { throw new ZohoError("unavailable"); }
  if (!response.ok) throw new ZohoError("unavailable");
  if (result.success !== true || result.hostname !== new URL(origin).hostname || result.action !== env.ENQUIRY_TURNSTILE_ACTION) throw new ZohoError("challenge_failed", { status: 403 });
}
