import { getAccessToken, invalidateAccessToken } from "./oauth.js";
import { ZohoError } from "./errors.js";
import { serviceMode, VERIFIED, checkedSetting, TICKET_CATEGORIES, BRANCHES } from "./verified.js";

const crmFields = {
  Leads: ["Layout", "First_Name", "Last_Name", "Mobile", "Email", "Company", "Lead_Status", "Lead_Source", "Interested_Brand", "Interested_Model", "New_or_Used", "Preferred_Branch", "Next_Follow_up_Date", "Preferred_Language", "Description", "Body_Type", "Purchase_Timeline", "Budget", "Payment_Method", "Preferred_Contact_Method", "Customer_Type", "Has_Trade_In", "Trade_In_Details"],
  Contacts: ["Layout", "Last_Name", "Primary_Contact_First_Name", "Email", "Mobile"],
  Service_Appointments: ["Layout", "Name", "Customer", "Customer_Mobile", "Email", "Vehicle_Brand", "Vehicle_Model", "Registration_Plate_Number", "Service_Centre", "Appointment_Status", "Appointment_Date", "Appointment_Time", "Service_Type", "Customer_Complaint_Requested_Work", "Customer_Notes"],
};
function fenceWrite(system, path, data, env) {
  const reject = () => { throw new ZohoError("integration_unconfigured"); };
  if (system === "desk") {
    if (env.ZOHO_SUPPORT_MODE !== "desk" || !data || Object.keys(data).some((key) => !["departmentId", "subject", "description", "channel", "priority", "status", "contact", "cf"].includes(key))
      || data.departmentId !== VERIFIED.deskDepartment || data.status !== "Open" || data.channel !== "Web"
      || !["High", "Medium", "Low"].includes(data.priority) || !data.contact
      || !data.cf || Object.keys(data.cf).some((key) => !["cf_af_ticket_category", "cf_af_branch", "cf_af_vehicle_plate_number"].includes(key))
      || !TICKET_CATEGORIES.includes(data.cf.cf_af_ticket_category) || !BRANCHES.includes(data.cf.cf_af_branch)
      || (data.cf.cf_af_vehicle_plate_number !== undefined && (typeof data.cf.cf_af_vehicle_plate_number !== "string" || data.cf.cf_af_vehicle_plate_number.length > 100))
      || Object.keys(data.contact).some((key) => !["lastName", "firstName", "email", "phone"].includes(key))) reject();
    return;
  }
  const expected = { Leads: VERIFIED.leadsLayout, Contacts: VERIFIED.contactsLayout, Service_Appointments: VERIFIED.appointmentsLayout }[path];
  if (path === "Leads" ? env.ZOHO_ENABLE_CRM_LEADS !== "true" : serviceMode(env) !== "appointment") reject();
  if (!data || Object.keys(data).some((key) => !["data", "trigger"].includes(key)) || !Array.isArray(data.data) || data.data.length !== 1) reject();
  const record = data.data[0];
  if (!record || record.Layout?.id !== expected || Object.keys(record.Layout).some((key) => key !== "id")
    || Object.keys(record).some((key) => !crmFields[path]?.includes(key))) reject();
  if (path === "Leads" && (record.Lead_Status !== "New Enquiry" || record.Lead_Source !== "Website Enquiry"
    || JSON.stringify(data.trigger) !== '["workflow"]')) reject();
  if (path === "Service_Appointments" && (record.Appointment_Status !== "Requested" || !/^\d+$/.test(record.Customer?.id || "")
    || Object.keys(record.Customer).some((key) => key !== "id"))) reject();
  if (path !== "Leads" && data.trigger !== undefined) reject();
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const providerCodes = new Set(["INVALID_DATA", "MANDATORY_NOT_FOUND", "DUPLICATE_DATA", "INVALID_TOKEN", "INVALID_OAUTHTOKEN", "AUTHENTICATION_FAILURE", "OAUTH_SCOPE_MISMATCH", "NO_PERMISSION", "TOO_MANY_REQUESTS"]);
const fields = new Set(["First_Name", "Last_Name", "Mobile", "Email", "Interested_Brand", "Interested_Model", "New_or_Used", "Preferred_Branch", "Next_Follow_up_Date", "Layout", "Primary_Contact_First_Name", "Customer", "Service_Centre", "Service_Type", "Appointment_Date", "Appointment_Time", "departmentId", "contactId", "subject"]);
function failure(status, body, { uncertain = false } = {}) {
  const entry = body?.data?.[0] || body;
  return new ZohoError(status === 429 ? "rateLimited" : status === 400 || status === 422 ? "provider_validation" : uncertain ? "result_unknown" : "unavailable", {
    status: status === 429 ? 429 : status === 400 || status === 422 ? 422 : 503, uncertain,
    providerCode: providerCodes.has(entry?.code) ? entry.code : undefined,
    field: fields.has(entry?.details?.api_name) ? entry.details.api_name : undefined,
  });
}
export function createZohoClient(env, { fetchImpl = fetch, sleep = wait, now = Date.now } = {}) {
  async function send(system, path, { method = "POST", data, query } = {}) {
    const allowed = system === "crm" ? { Leads: "POST", Contacts: "POST", "Contacts/search": "GET", Service_Appointments: "POST" } : { tickets: "POST" };
    if (allowed[path] !== method) throw new ZohoError("integration_unconfigured");
    if (path === "Contacts/search" ? !query || Object.keys(query).length !== 1 || !Object.entries(query).every(([key, value]) => ["email", "phone"].includes(key) && typeof value === "string" && value.length > 0 && value.length <= 100) : query !== undefined) throw new ZohoError("integration_unconfigured");
    checkedSetting(env, "ZOHO_CRM_API_VERSION", "v8");
    if (path === "Leads") checkedSetting(env, "ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID", VERIFIED.leadAssignmentRule);
    if (method === "POST") fenceWrite(system, path, data, env);
    if (system === "desk") { checkedSetting(env, "ZOHO_DESK_API_BASE", VERIFIED.deskBase); checkedSetting(env, "ZOHO_DESK_ORG_ID", VERIFIED.deskOrg); }
    let refreshed = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const token = await getAccessToken(env, { fetchImpl, sleep, now });
      const url = new URL((system === "crm" ? token.apiDomain + "/crm/v8" : VERIFIED.deskBase) + "/" + path);
      if (system === "crm" && path === "Leads") url.searchParams.set("lar_id", VERIFIED.leadAssignmentRule);
      if (query) for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
      let response;
      try {
        response = await fetchImpl(url.toString(), {
          method, redirect: "error",
          headers: { authorization: "Zoho-oauthtoken " + token.accessToken, ...(data ? { "content-type": "application/json" } : {}), ...(system === "desk" ? { orgId: VERIFIED.deskOrg } : {}) },
          ...(data ? { body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(8000),
        });
      } catch { throw new ZohoError(method === "POST" ? "result_unknown" : "unavailable", { uncertain: method === "POST" }); }
      if (response.status === 204 && method === "GET") return null;
      if ((response.status === 429 || response.status >= 500 && method === "GET") && attempt < 2) {
        const requested = Number(response.headers.get("retry-after"));
        await sleep(Math.min(1000, requested > 0 ? requested * 1000 : 250 * 2 ** attempt)); continue;
      }
      let body; try { body = await response.json(); } catch { throw failure(response.status, null, { uncertain: method === "POST" && response.status !== 400 && response.status !== 429 }); }
      const code = body?.code || body?.data?.[0]?.code;
      if (response.status === 401 && ["INVALID_TOKEN", "INVALID_OAUTHTOKEN", "AUTHENTICATION_FAILURE"].includes(code) && !refreshed) {
        refreshed = true; await invalidateAccessToken(env, token.accessToken); continue;
      }
      // A definite throttle can be retried. An ambiguous create failure must
      // not be repeated automatically: it may already have created a record.

      if (!response.ok) throw failure(response.status, body, { uncertain: method === "POST" && response.status >= 500 });
      if (system === "crm" && method === "GET" && (!Array.isArray(body?.data) || body.data.some((record) => typeof record.id !== "string" || !/^\d+$/.test(record.id)))) throw new ZohoError("unavailable");
      if (system === "crm" && method === "POST") {
        const record = body?.data?.[0];
        if (body?.data?.length !== 1 || record?.code !== "SUCCESS" || ![undefined, "success"].includes(record?.status) || !/^\d+$/.test(String(record?.details?.id || ""))) throw failure(record?.status === "error" ? 422 : 502, body, { uncertain: record?.status !== "error" });
      } else if (system === "desk" && !/^\d+$/.test(String(body?.id || ""))) throw failure(502, body, { uncertain: true });
      return body;
    }
    throw new ZohoError("unavailable");
  }
  return {
    crm: (path, options) => send("crm", path, options),
    desk: (path, options) => send("desk", path, options),
  };
}
