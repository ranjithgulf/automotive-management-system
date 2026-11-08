import { serviceMode } from "./verified.js";
import { createZohoClient } from "./client.js";
import { buildContact, buildAppointment, buildLead } from "./mappings.js";
import { ZohoError, unconfigured } from "./errors.js";

function contactId(response) {
  if (!response || !response.data?.length) return null;
  if (response.data.length !== 1 || response.info?.more_records) throw new ZohoError("contact_ambiguous", { status: 409 });
  const id = response.data[0].id;
  if (typeof id !== "string" || !/^\d+$/.test(id)) throw new ZohoError("unavailable");
  return id;
}
export async function submitServiceEnquiry(packet, env, { client = createZohoClient(env), now = new Date() } = {}) {
  if (packet?.version !== 2 || !["lead", "appointment"].includes(serviceMode(env))) throw unconfigured();
  if (serviceMode(env) === "lead") {
    if (env.ZOHO_ENABLE_CRM_LEADS !== "true") throw unconfigured();
    const response = await client.crm("Leads", { data: buildLead(packet, env, now) });
    return { ok: true, delivered: true, confirmed: false, recordId: response.data[0].details.id, module: "Leads" };
  }
  if (serviceMode(env) !== "appointment") throw unconfigured();
  const v = packet.values;
  let id = v.email ? contactId(await client.crm("Contacts/search", { method: "GET", query: { email: v.email } })) : null;
  if (!id) id = contactId(await client.crm("Contacts/search", { method: "GET", query: { phone: v.mobile } }));
  let createdContact = false;
  if (!id) {
    const created = await client.crm("Contacts", { data: buildContact(packet) });
    // CRM search may lag creation by ~15 seconds. Use the authoritative POST ID
    // immediately; do not re-search, poll, or create another Contact to confirm it.
    id = created.data[0].details.id;
    createdContact = true;
  }
  let response;
  try { response = await client.crm("Service_Appointments", { data: buildAppointment(packet, env, id, now) }); }
  catch (error) {
    // Even a definite appointment rejection leaves a newly created Contact.
    // Block automatic replay of that partial workflow during CRM indexing lag.
    if (createdContact) throw new ZohoError("result_unknown", { uncertain: true, providerCode: error.providerCode, field: error.field });
    throw error;
  }
  return { ok: true, delivered: true, confirmed: false, recordId: response.data[0].details.id, module: "Service_Appointments" };
}
