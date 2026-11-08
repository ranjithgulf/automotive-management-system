import { normalizePhone, validPhone, choiceValues } from "../../src/lib/website/forms.js";
import { invalid } from "./errors.js";
import { BRANDS, BRANCHES, CONDITIONS, BODY_TYPES, TIMELINES, PAYMENTS, CONTACT_METHODS, CUSTOMER_TYPES, SERVICE_TYPES, APPOINTMENT_TIMES, LEAD_KINDS, VERIFIED, TICKET_CATEGORIES } from "./verified.js";

const lengths = { firstName: 40, lastName: 80, mobile: 30, email: 100, company: 200, model: 200, message: 2000, tradeInDetails: 2000, registration: 100, subject: 180 };
const enums = { type: choiceValues.types, brand: BRANDS, branch: BRANCHES, condition: CONDITIONS, bodyType: BODY_TYPES, timeline: TIMELINES, paymentMethod: PAYMENTS, contactMethod: CONTACT_METHODS, customerType: CUSTOMER_TYPES, serviceType: SERVICE_TYPES, ticketCategory: TICKET_CATEGORIES };
const allowedValues = [...Object.keys(lengths), ...Object.keys(enums), "preferredDate", "preferredTime", "licenceConfirmed", "hasTradeIn", "budget"];
export function dubaiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: VERIFIED.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return p.year + "-" + p.month + "-" + p.day;
}
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function parsePhaseARequest(input, { now = new Date(), origin } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw invalid();
  const rootKeys = ["version", "idempotencyKey", "kind", "locale", "vehicleReference", "values", "turnstileToken", "consent", "consentVersion", "context"];
  if (Object.keys(input).some((key) => !rootKeys.includes(key)) || input.version !== 2) throw invalid();
  if (![...LEAD_KINDS, "service", "support"].includes(input.kind)) throw invalid("kind");
  if (!["en", "ar"].includes(input.locale)) throw invalid("locale");
  if (typeof input.idempotencyKey !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(input.idempotencyKey)) throw invalid("idempotencyKey");
  if (typeof input.turnstileToken !== "string" || !input.turnstileToken.length || input.turnstileToken.length > 2048) throw invalid("turnstileToken");
  if (input.consent !== true || typeof input.consentVersion !== "string" || !/^[a-zA-Z0-9._-]{1,80}$/.test(input.consentVersion)) throw invalid("consent");
  if (input.vehicleReference !== undefined && (typeof input.vehicleReference !== "string" || input.vehicleReference.length > 100)) throw invalid("vehicleReference");
  if (!input.values || typeof input.values !== "object" || Array.isArray(input.values) || Object.keys(input.values).some((key) => !allowedValues.includes(key))) throw invalid("values");
  const values = {};
  for (const [key, raw] of Object.entries(input.values)) {
    if (["licenceConfirmed", "hasTradeIn"].includes(key)) { if (typeof raw !== "boolean") throw invalid(key); values[key] = raw; continue; }
    if (key === "budget") { if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 1e9) throw invalid(key); values[key] = raw; continue; }
    if (typeof raw !== "string" || raw.length > (lengths[key] || 200) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw)) throw invalid(key);
    values[key] = raw.trim();
    if (enums[key] && !enums[key].includes(values[key])) throw invalid(key);
  }
  for (const key of ["firstName", "lastName", "mobile", "message"]) if (!values[key]) throw invalid(key);
  values.mobile = normalizePhone(values.mobile).replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(values.mobile) || !validPhone(values.mobile)) throw invalid("mobile");
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) throw invalid("email");
  if (LEAD_KINDS.includes(input.kind)) for (const key of ["brand", "model", "condition", "branch"]) if (!values[key]) throw invalid(key);
  if (input.kind === "trade-in" && !values.tradeInDetails) throw invalid("tradeInDetails");
  if (values.hasTradeIn && !values.tradeInDetails) throw invalid("tradeInDetails");
  if (["drive", "service"].includes(input.kind)) {
    if (!validDate(values.preferredDate) || values.preferredDate < dubaiDate(now)) throw invalid("preferredDate");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(values.preferredTime || "")) throw invalid("preferredTime");
  }
  if (input.kind === "drive" && values.licenceConfirmed !== true) throw invalid("licenceConfirmed");
  if (input.kind === "service") {
    for (const key of ["branch", "serviceType"]) if (!values[key]) throw invalid(key);
    if (!APPOINTMENT_TIMES.includes(values.preferredTime)) throw invalid("preferredTime");
  }
  if (input.kind === "support" && !values.subject) throw invalid("subject");
  const context = {};
  if (input.context !== undefined) {
    if (!input.context || typeof input.context !== "object" || Array.isArray(input.context)) throw invalid("context");
    for (const [key, value] of Object.entries(input.context)) {
      if (!["pageUrl", "utmSource", "utmMedium", "utmCampaign"].includes(key) || typeof value !== "string" || value.length > (key === "pageUrl" ? 1000 : 100)) throw invalid("context");
      if (key === "pageUrl") {
        let url; try { url = new URL(value); } catch { throw invalid("pageUrl"); }
        if (url.origin !== origin || url.username || url.password) throw invalid("pageUrl");
        context.pageUrl = url.origin + url.pathname; // Do not collect arbitrary query/fragment PII.
      } else context[key] = value.replace(/[\r\n]/g, " ").trim();
    }
  }
  return { version: 2, idempotencyKey: input.idempotencyKey, kind: input.kind, locale: input.locale, vehicleReference: input.vehicleReference || "", values, context, consent: true, consentVersion: input.consentVersion, turnstileToken: input.turnstileToken };
}
