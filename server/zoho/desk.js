import { createZohoClient } from "./client.js";
import { buildDeskTicket, buildLead } from "./mappings.js";
import { unconfigured, invalid } from "./errors.js";

export async function submitDeskEnquiry(packet, env, { client = createZohoClient(env), now = new Date() } = {}) {
  if (packet?.version !== 2 || !["lead", "desk"].includes(env.ZOHO_SUPPORT_MODE)) throw unconfigured();
  if (env.ZOHO_SUPPORT_MODE === "lead") {
    if (env.ZOHO_ENABLE_CRM_LEADS !== "true") throw unconfigured();
    for (const key of ["brand", "model", "condition", "branch"]) if (!packet.values[key]) throw invalid(key);
    const response = await client.crm("Leads", { data: buildLead(packet, env, now) });
    return { ok: true, delivered: true, confirmed: false, recordId: response.data[0].details.id, module: "Leads" };
  }
  if (env.ZOHO_SUPPORT_MODE !== "desk") throw unconfigured();
  const response = await client.desk("tickets", { data: buildDeskTicket(packet, env, now) });
  return { ok: true, delivered: true, confirmed: false, recordId: response.id, module: "Desk" };
}
