export function normalizePhone(value) { return String(value).replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660)).replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0)); }

export function formFields(kind) {
  const fields = [{ key: "name", type: "text", required: true, max: 100 }];
  if (kind === "contact") fields.push({ key: "company", type: "text", max: 150 });
  fields.push({ key: "email", type: "email", required: true, max: 200 }, { key: "phone", type: "tel", required: true, max: 30 });
  if (["vehicle", "drive"].includes(kind)) fields.push({ key: "method", type: "select", options: "methods", required: true });
  if (kind === "contact") fields.push({ key: "type", type: "select", options: "types", required: true });
  if (kind === "service") fields.push({ key: "brand", type: "text", required: true, max: 100 }, { key: "model", type: "text", required: true, max: 100 }, { key: "registration", type: "text", max: 30 }, { key: "branch", type: "select", options: "branches", required: true }, { key: "service", type: "select", options: "services", required: true });
  if (["service", "drive"].includes(kind)) fields.push({ key: "date", type: "date", required: true }, { key: "time", type: "time", required: true });
  fields.push({ key: "message", type: "textarea", required: true, max: 2000 });
  return fields;
}

export function validateEnquiry(values, fields, options, today) {
  const errors = {};
  for (const field of fields) {
    const value = String(values[field.key] || "").trim();
    if (field.required && !value) errors[field.key] = "required";
    else if (field.max && value.length > field.max) errors[field.key] = "tooLong";
    else if (value && field.key === "name" && value.length < 2) errors[field.key] = "invalidName";
    else if (value && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = "invalidEmail";
    else if (value && field.type === "tel" && !/^\+?[\d\s()-]{7,30}$/.test(normalizePhone(value))) errors[field.key] = "invalidPhone";
    else if (value && field.type === "select" && !options[field.options]?.some((item) => item.value === value)) errors[field.key] = "invalidChoice";
    else if (value && field.type === "date") {
      const parsed = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value < today) errors[field.key] = "invalidDate";
    } else if (value && field.type === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) errors[field.key] = "invalidChoice";
  }
  return errors;
}
