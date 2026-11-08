import { parseSubmission } from "../../src/lib/website/enquiry-contract.js";
import { parsePhaseARequest } from "../../server/zoho/validation.js";
import { approvedOrigins } from "../../server/zoho/protection.js";
import { submitPhaseA } from "../../server/zoho/submit.js";
import { safeFailure } from "../../server/zoho/errors.js";

const MAX_BYTES = 8192;
const json = (status, body) => Response.json(body, {
  status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff", ...([429, 503].includes(status) ? { "retry-after": status === 429 ? "600" : "60" } : {}) },
});
const failure = (status, code) => json(status, { ok: false, code, delivered: false, confirmed: false });
async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks = []; let length = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_BYTES) { await reader.cancel(); throw new Error("too_large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function createEnquiryHandler({ fetchImpl = fetch, now = () => new Date(), sleep, logger = console } = {}) {
  return async function handleEnquiry({ request, env = {} }) {
    if (request.method !== "POST") return new Response(null, { status: 405, headers: { allow: "POST", "cache-control": "no-store" } });
    const origin = new URL(request.url).origin;
    if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") return failure(403, "forbidden");
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) return failure(415, "invalid");
    if (Number(request.headers.get("content-length")) > MAX_BYTES) return failure(413, "too_large");
    let input;
    try { input = await readBody(request); } catch (error) { return failure(error.message === "too_large" ? 413 : 400, "invalid"); }
    // Keep existing demo forms compatible, but never infer missing mandatory
    // Zoho fields from a full name, sample reference or unverified branch ID.
    if (input?.version === 1) return parseSubmission(input) ? failure(503, "integration_unconfigured") : failure(400, "invalid");
    try {
      const receivedAt = now();
      const packet = parsePhaseARequest(input, { now: receivedAt, origin });
      if (!approvedOrigins(env).includes(origin)) return failure(403, "forbidden");
      return json(200, await submitPhaseA(packet, env, { request, fetchImpl, now: receivedAt, sleep }));
    } catch (error) {
      const safe = safeFailure(error);
      // Only known codes/verified API field names are logged; not Error objects,
      // request data, provider messages, credentials or public/internal IDs.
      if (safe.providerCode || safe.field) logger.warn?.({ event: "zoho_enquiry_rejected", code: safe.code, providerCode: safe.providerCode, field: safe.field, status: safe.status });
      return failure(safe.status, safe.code);
    }
  };
}
export const onRequest = createEnquiryHandler();
