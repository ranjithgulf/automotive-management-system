import { services } from "../mock-data/website.js";

export const enquiryKinds = ["contact", "vehicle", "drive", "quotation", "service", "support"];
export const choiceValues = {
  methods: ["email", "phone"],
  types: ["general", "vehicle", "solution", "parts", "fleet"],
  branches: ["dubai", "abudhabi", "sharjah", "discuss"],
  services: services.map((service) => service.id),
  categories: ["general", "vehicle", "service", "parts", "other"],
};
export function createFormOptions(d, locale) {
  const labels = {
    methods: [d.form.emailMethod, d.form.phoneMethod],
    types: d.form.contactTypes,
    branches: d.form.branches,
    services: services.map((service) => service.title[locale] || service.title.en),
    categories: d.form.supportCategories,
  };
  return Object.fromEntries(Object.entries(choiceValues).map(([key, values]) => [key, values.map((value, i) => ({ value, label: labels[key][i] }))]));
}
export function normalizePhone(value) {
  return String(value).replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660)).replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}
export function validPhone(value) {
  const normalized = normalizePhone(value).trim();
  if (!/^\+?[\d\s()-]+$/.test(normalized)) return false;
  const compact = normalized.replace(/[\s()-]/g, "");
  if (!compact.startsWith("+")) return /^\d{7,12}$/.test(compact);
  const gcc = { "971": 9, "968": 8, "974": 8, "966": 9, "965": 8, "973": 8 };
  const code = Object.keys(gcc).find((prefix) => compact.startsWith("+" + prefix));
  return code ? new RegExp("^\\+" + code + "\\d{" + gcc[code] + "}$").test(compact) : /^\+[1-9]\d{7,14}$/.test(compact);
}
export function formFields(kind) {
  const fields = [{ key: "name", type: "text", required: true, max: 100 }];
  if (kind === "contact") fields.push({ key: "company", type: "text", max: 150 });
  fields.push({ key: "email", type: "email", required: true, max: 200 }, { key: "phone", type: "tel", required: true, max: 30 });
  if (["vehicle", "drive", "quotation"].includes(kind)) fields.push({ key: "interest", type: "text", required: true, max: 200 });
  if (["vehicle", "drive"].includes(kind)) fields.push({ key: "method", type: "select", options: "methods", required: true });
  if (kind === "contact") fields.push({ key: "type", type: "select", options: "types", required: true });
  if (kind === "support") fields.push({ key: "category", type: "select", options: "categories", required: true }, { key: "subject", type: "text", required: true, max: 180 });
  if (kind === "service") fields.push({ key: "brand", type: "text", required: true, max: 100 }, { key: "model", type: "text", required: true, max: 100 }, { key: "registration", type: "text", max: 30 }, { key: "branch", type: "select", options: "branches", required: true }, { key: "service", type: "select", options: "services", required: true });
  if (["service", "drive"].includes(kind)) fields.push({ key: "date", type: "date", required: true }, { key: "time", type: "time", required: true });
  fields.push({ key: "message", type: "textarea", required: true, max: 2000 });
  return fields;
}
export function validateEnquiry(values, fields, options, today) {
  const errors = {};
  for (const field of fields) {
    const raw = values[field.key];
    if (raw !== undefined && typeof raw !== "string") { errors[field.key] = "invalidChoice"; continue; }
    const value = (raw || "").trim();
    if (field.required && !value) errors[field.key] = "required";
    else if (field.max && value.length > field.max) errors[field.key] = "tooLong";
    else if (value && field.key === "name" && value.length < 2) errors[field.key] = "invalidName";
    else if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = "invalidEmail";
    else if (value && field.type === "tel" && !validPhone(value)) errors[field.key] = "invalidPhone";
    else if (value && field.type === "select" && !options[field.options]?.some((item) => item.value === value)) errors[field.key] = "invalidChoice";
    else if (value && field.type === "date") {
      const parsed = new Date(value + "T00:00:00Z");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < today) errors[field.key] = "invalidDate";
    } else if (value && field.type === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) errors[field.key] = "invalidChoice";
  }
  return errors;
}
