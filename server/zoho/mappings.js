import { invalid, unconfigured } from "./errors.js";
import { VERIFIED, checkedSetting, TICKET_CATEGORIES, BRANCHES } from "./verified.js";
import { dubaiDate, validDate } from "./validation.js";

export function nextFollowUpDate(env, now = new Date()) {
  // Country and timezone do not define working days/holidays. Require approval.
  const days = String(env.ZOHO_WORKING_WEEKDAYS || "").split(",").map((s) => s.trim());
  if (!days.length || days.some((s) => !/^[0-6]$/.test(s))) throw unconfigured();
  const holidays = String(env.ZOHO_HOLIDAYS || "").split(",").filter(Boolean).map((s) => s.trim());
  if (holidays.some((s) => !validDate(s))) throw unconfigured();
  const date = new Date(dubaiDate(now) + "T00:00:00Z");
  for (let i = 0; i < 370; i++) {
    date.setUTCDate(date.getUTCDate() + 1);
    const value = date.toISOString().slice(0, 10);
    if (days.includes(String(date.getUTCDay())) && !holidays.includes(value)) return value;
  }
  throw unconfigured();
}
export function description(packet, env, now = new Date()) {
  const labels = { contact: "General enquiry", vehicle: "Vehicle enquiry", quotation: "Quotation request", drive: "Test drive request", "trade-in": "Trade-in request", service: "Service booking", support: "Complaint" };
  const v = packet.values;
  return [
    "[" + labels[packet.kind] + "] " + v.message,
    packet.vehicleReference ? "Viewed vehicle reference (unverified): " + packet.vehicleReference : "",
    v.type ? "Website enquiry topic: " + v.type : "",
    v.model ? "Vehicle/model: " + (v.brand || "") + " " + v.model : "",
    v.preferredDate ? "Preferred date/time (Asia/Dubai): " + v.preferredDate + " " + v.preferredTime : "",
    packet.kind === "drive" ? "Visitor confirms holding a driving licence; not verified by website." : "",
    packet.context.pageUrl ? "Page: " + packet.context.pageUrl : "",
    "UTM: " + [packet.context.utmSource, packet.context.utmMedium, packet.context.utmCampaign].filter(Boolean).join("/"),
    "Consent: " + (packet.locale === "ar" ? env.ENQUIRY_CONSENT_TEXT_AR : env.ENQUIRY_CONSENT_TEXT) + " [" + packet.consentVersion + "] at " + now.toISOString(),
  ].filter(Boolean).join("\n");
}
export function buildLead(packet, env, now = new Date()) {
  const v = packet.values;
  if (packet.kind === "service") {
    if (!v.brand || !v.condition) throw invalid(!v.brand ? "brand" : "condition");
  }
  const record = {
    Layout: { id: checkedSetting(env, "ZOHO_CRM_LEADS_LAYOUT_ID", VERIFIED.leadsLayout) },
    First_Name: v.firstName, Last_Name: v.lastName, Mobile: v.mobile,
    Lead_Status: "New Enquiry", Lead_Source: "Website Enquiry",
    Interested_Brand: v.brand, Interested_Model: packet.kind === "service" ? "Service booking" : v.model,
    New_or_Used: v.condition, Preferred_Branch: v.branch,
    Next_Follow_up_Date: nextFollowUpDate(env, now),
    Preferred_Language: packet.locale === "ar" ? "Arabic" : "English",
    Description: description(packet, env, now),
  };
  for (const [source, target] of Object.entries({ email: "Email", company: "Company", bodyType: "Body_Type", timeline: "Purchase_Timeline", budget: "Budget", paymentMethod: "Payment_Method", contactMethod: "Preferred_Contact_Method", customerType: "Customer_Type", tradeInDetails: "Trade_In_Details" })) if (v[source] !== undefined && v[source] !== "") record[target] = v[source];
  if (packet.kind === "trade-in") record.Has_Trade_In = true;
  else if (v.hasTradeIn !== undefined) record.Has_Trade_In = v.hasTradeIn;
  return { data: [record], trigger: ["workflow"] };
}
export function buildContact(packet) {
  const v = packet.values;
  return { data: [{ Layout: { id: VERIFIED.contactsLayout }, Last_Name: v.lastName, Primary_Contact_First_Name: v.firstName, ...(v.email ? { Email: v.email } : {}), Mobile: v.mobile }] };
}
export function buildAppointment(packet, env, contactId, now = new Date()) {
  if (!/^\d+$/.test(contactId)) throw invalid();
  const v = packet.values;
  return { data: [{
    Layout: { id: checkedSetting(env, "ZOHO_CRM_SERVICE_APPOINTMENTS_LAYOUT_ID", VERIFIED.appointmentsLayout) },
    Name: [v.firstName + " " + v.lastName, v.serviceType, v.preferredDate].join(" - "),
    Customer: { id: contactId }, Customer_Mobile: v.mobile, ...(v.email ? { Email: v.email } : {}),
    ...(v.brand ? { Vehicle_Brand: v.brand } : {}), ...(v.model ? { Vehicle_Model: v.model } : {}),
    ...(v.registration ? { Registration_Plate_Number: v.registration } : {}),
    Service_Centre: v.branch, Appointment_Status: "Requested",
    Appointment_Date: v.preferredDate, Appointment_Time: v.preferredTime, Service_Type: v.serviceType,
    Customer_Complaint_Requested_Work: v.message, Customer_Notes: description(packet, env, now),
  }] };
}
const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export function buildDeskTicket(packet, env, now = new Date()) {
  const v = packet.values;
  if (!TICKET_CATEGORIES.includes(v.ticketCategory) || !BRANCHES.includes(v.branch)) throw invalid("ticketCategory");
  return {
    departmentId: checkedSetting(env, "ZOHO_DESK_DEPARTMENT_ID", VERIFIED.deskDepartment),
    subject: "[Website] " + v.subject, description: escapeHtml(description(packet, env, now)).replace(/\n/g, "<br>"),
    channel: "Web", priority: "Medium", status: "Open",
    cf: { cf_af_ticket_category: v.ticketCategory, cf_af_branch: v.branch, ...(v.registration ? { cf_af_vehicle_plate_number: v.registration } : {}) },
    contact: { lastName: v.lastName, firstName: v.firstName, ...(v.email ? { email: v.email } : {}), phone: v.mobile },
  };
}
