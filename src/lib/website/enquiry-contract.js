import { enquiryKinds, choiceValues, formFields, validateEnquiry } from "./forms.js";

/**
 * Website-only contract, not Zoho field API names.
 * @typedef {{version: 1, idempotencyKey: string, kind: string, locale: "en"|"ar", vehicleReference: string, values: Record<string, string>}} EnquiryRequest
 * @typedef {{mode: "demo"|"live", delivered: boolean, confirmed: boolean, stored?: boolean}} EnquiryResult
 */
export function createSubmission(values, { idempotencyKey = crypto.randomUUID() } = {}) {
  const kind = values.kind || "contact";
  return {
    version: 1, idempotencyKey, kind, locale: values.locale || "en",
    vehicleReference: typeof values.vehicleReference === "string" ? values.vehicleReference.trim().slice(0, 100) : "",
    values: Object.fromEntries(formFields(kind).map(({ key }) => [key, typeof values[key] === "string" ? values[key].trim() : ""])),
  };
}
export function parseSubmission(input, today = new Date().toISOString().slice(0, 10)) {
  if (!input || typeof input !== "object" || Array.isArray(input)
    || input.version !== 1 || !enquiryKinds.includes(input.kind) || !["en", "ar"].includes(input.locale)
    || typeof input.idempotencyKey !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(input.idempotencyKey)
    || typeof input.vehicleReference !== "string" || input.vehicleReference.length > 100
    || !input.values || typeof input.values !== "object" || Array.isArray(input.values)) return null;
  if (Object.keys(input).some((key) => !["version", "idempotencyKey", "kind", "locale", "vehicleReference", "values"].includes(key))) return null;
  const fields = formFields(input.kind);
  const keys = fields.map(({ key }) => key);
  if (Object.keys(input.values).some((key) => !keys.includes(key))) return null;
  const options = Object.fromEntries(Object.entries(choiceValues).map(([key, choices]) => [key, choices.map((value) => ({ value }))]));
  if (Object.keys(validateEnquiry(input.values, fields, options, today)).length) return null;
  return { ...input, values: Object.fromEntries(fields.map(({ key }) => [key, (input.values[key] || "").trim()])) };
}

/** Verified Phase A contract. No names, branch choices, IDs or consent are inferred. */
export function createVerifiedSubmission(input, { idempotencyKey = crypto.randomUUID() } = {}) {
  const fields = ["firstName","lastName","mobile","email","company","brand","model","condition","branch","message","bodyType","budget","paymentMethod","timeline","hasTradeIn","tradeInDetails","contactMethod","customerType","preferredDate","preferredTime","licenceConfirmed","registration","serviceType","subject","ticketCategory","type"];
  return { version: 2, idempotencyKey, kind: input.kind, locale: input.locale, vehicleReference: input.vehicleReference || "",
    values: Object.fromEntries(fields.filter((key) => input.values?.[key] !== undefined).map((key) => [key, input.values[key]])),
    turnstileToken: input.turnstileToken, consent: input.consent, consentVersion: input.consentVersion, context: input.context || {} };
}
