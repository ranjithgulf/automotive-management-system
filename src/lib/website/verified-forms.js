import { BRANDS, BRANCHES, CONDITIONS, CONTACT_METHODS, SERVICE_TYPES, APPOINTMENT_TIMES, TICKET_CATEGORIES, ARABIC_CHOICES } from "./zoho-choices.js";
import { validateEnquiry, normalizePhone, choiceValues } from "./forms.js";

export function verifiedFormOptions(locale, dictionary) {
  const sets = { types: choiceValues.types, brands: BRANDS, branches: BRANCHES, conditions: CONDITIONS, methods: CONTACT_METHODS, services: SERVICE_TYPES, times: APPOINTMENT_TIMES, categories: TICKET_CATEGORIES };
  const labels = { branches: "branches", conditions: "New_or_Used", methods: "Preferred_Contact_Method", services: "Service_Type", categories: "cf_af_ticket_category" };
  return Object.fromEntries(Object.entries(sets).map(([key, values]) => [key, values.map((value) => ({ value, label: key === "types" ? dictionary?.form.contactTypes[values.indexOf(value)] || value : locale === "ar" ? ARABIC_CHOICES[labels[key]]?.[value] || value : value }))]));
}
export function verifiedFormFields(kind, { serviceMode = "appointment", supportMode = "desk" } = {}) {
  const field = (key, type = "text", max, options, required = true) => ({ key, type, max, options, required });
  const fields = [field("firstName", "text", 40), field("lastName", "text", 80), field("email", "email", 100, undefined, false), field("mobile", "tel", 30)];
  if (kind === "contact") fields.push(field("company", "text", 200, undefined, false), field("type", "select", undefined, "types"));
  const lead = !["service", "support"].includes(kind) || kind === "service" && serviceMode === "lead" || kind === "support" && supportMode === "lead";
  if (kind !== "support" || lead) fields.push(field("brand", "select", undefined, "brands", lead), field("model", "text", 200, undefined, lead));
  if (lead) fields.push(field("condition", "select", undefined, "conditions"));
  fields.push(field("branch", "select", undefined, "branches"));
  if (lead) fields.push(field("contactMethod", "select", undefined, "methods", false));
  if (kind === "support") fields.push(field("ticketCategory", "select", undefined, "categories"), field("subject", "text", 180));
  if (["service", "support"].includes(kind)) fields.push(field("registration", "text", 100, undefined, false));
  if (kind === "service") fields.push(field("serviceType", "select", undefined, "services"));
  if (["service", "drive"].includes(kind)) fields.push(field("preferredDate", "date"), field("preferredTime", kind === "service" ? "select" : "time", undefined, kind === "service" ? "times" : undefined));
  if (kind === "trade-in") fields.push(field("tradeInDetails", "textarea", 2000));
  fields.push(field("message", "textarea", 2000));
  return fields;
}
export function validateVerifiedForm(values, kind, locale, today, routes) {
  const errors = validateEnquiry(values, verifiedFormFields(kind, routes), verifiedFormOptions(locale), today);
  const mobile = normalizePhone(values.mobile || "").replace(/[\s()-]/g, "");
  if (values.mobile && !/^\+[1-9]\d{7,14}$/.test(mobile)) errors.mobile = "invalidPhone";
  if (kind === "drive" && values.licenceConfirmed !== true) errors.licenceConfirmed = "required";
  return errors;
}
export function verifiedFormValues(values, kind, routes) {
  const keys = verifiedFormFields(kind, routes).map(({ key }) => key);
  if (kind === "drive") keys.push("licenceConfirmed");
  return Object.fromEntries(keys.filter((key) => values[key] !== undefined && values[key] !== "").map((key) => [key, typeof values[key] === "string" ? values[key].trim() : values[key]]));
}
export function dubaiToday() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map(({type,value}) => [type,value]));
  return parts.year + "-" + parts.month + "-" + parts.day;
}
