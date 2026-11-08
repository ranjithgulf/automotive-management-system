import { ZohoError, unconfigured } from "./errors.js";
import { featureRoute, assertProtection, privateHash, guardCall, verifyTurnstile } from "./protection.js";
import { submitCrmEnquiry } from "./crm.js";
import { submitServiceEnquiry } from "./service.js";
import { submitDeskEnquiry } from "./desk.js";
import { createZohoClient } from "./client.js";

function canonical(value) {
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}
export async function submitPhaseA(packet, env, { request, fetchImpl = fetch, now = new Date(), sleep } = {}) {
  const route = featureRoute(packet, env, now);
  assertProtection(env);
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip || ip.length > 64) throw unconfigured();
  const { turnstileToken: omittedToken, idempotencyKey: key, ...business } = packet;
  void omittedToken;
  const claim = await guardCall(env, "claim", {
    key, ipHash: await privateHash(env, "ip:" + ip),
    fingerprint: await privateHash(env, "submission:" + JSON.stringify(canonical({ route, packet: business }))),
  });
  if (claim.status === "completed") return { ok: true, delivered: true, confirmed: false };
  if (claim.status !== "acquired" || typeof claim.claimToken !== "string") throw new ZohoError("unavailable");
  let result;
  try {
    await verifyTurnstile(packet, env, { origin: new URL(request.url).origin, ip, fetchImpl });
    const client = createZohoClient(env, { fetchImpl, ...(sleep ? { sleep } : {}) });
    const options = { client, now };
    result = packet.kind === "service" ? await submitServiceEnquiry(packet, env, options)
      : packet.kind === "support" ? await submitDeskEnquiry(packet, env, options)
        : await submitCrmEnquiry(packet, env, options);
    if (result?.ok !== true || result?.delivered !== true) throw new ZohoError("result_unknown", { uncertain: true });
  } catch (error) {
    if (error.uncertain) {
      try { await guardCall(env, "complete", { key, claimToken: claim.claimToken, status: "unknown" }); } catch { /* Keep pending; never release an ambiguous create. */ }
    } else {
      try { await guardCall(env, "release", { key, claimToken: claim.claimToken }); } catch { /* Failed release stays blocked rather than allowing duplicate writes. */ }
    }
    throw error;
  }
  try { await guardCall(env, "complete", { key, claimToken: claim.claimToken, status: "completed" }); }
  catch { throw new ZohoError("result_unknown", { uncertain: true }); }
  // Never expose the recordId, contactId, ticketNumber, provider body or token.
  return { ok: true, delivered: true, confirmed: false };
}
