import { unconfigured } from "./errors.js";
import { createZohoClient } from "./client.js";
import { buildLead } from "./mappings.js";

export async function submitCrmEnquiry(packet, env, { client = createZohoClient(env), now = new Date() } = {}) {
  if (packet?.version !== 2 || env.ZOHO_ENABLE_CRM_LEADS !== "true") throw unconfigured();
  const response = await client.crm("Leads", { data: buildLead(packet, env, now) });
  // Distinct enquiries ALWAYS insert. No email/mobile Lead search or upsert:
  // the verified AutoFlow workflow performs its own duplicate-note process.
  return { ok: true, delivered: true, confirmed: false, recordId: response.data[0].details.id, module: "Leads" };
}
