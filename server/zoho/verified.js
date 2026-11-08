// Source: user-provided ZOHO_INTEGRATION_HANDOFF.md, inspected 6 November 2026.
// Only these AutoFlow modules/layouts may be written. Never accept IDs from input.
export const VERIFIED = Object.freeze({
  accountsOrigin: "https://accounts.zoho.com",
  apiDomain: "https://www.zohoapis.com",
  deskBase: "https://desk.zoho.com/api/v1",
  crmOrgId: "785169496",
  leadAssignmentRule: "5413253000014544001",
  leadsLayout: "5413253000014418033",
  contactsLayout: "5413253000000091033",
  appointmentsLayout: "5413253000014444017",
  deskOrg: "785172113",
  deskDepartment: "759804000005916029",
  deskLayout: "759804000005918977",
  timezone: "Asia/Dubai",
});
export { BRANDS, BRANCHES, CONDITIONS, BODY_TYPES, TIMELINES, PAYMENTS, CONTACT_METHODS, CUSTOMER_TYPES, SERVICE_TYPES, APPOINTMENT_TIMES, LEAD_KINDS, TICKET_CATEGORIES } from "../../src/lib/website/zoho-choices.js";
export function checkedSetting(env, key, expected) {
  if (env[key] && env[key] !== expected) throw new Error("Unverified integration setting");
  return expected;
}

// Phase B approves direct service bookings; explicit disabled still fails closed.
export const serviceMode = (env) => env.ZOHO_SERVICE_MODE || "appointment";
