import { createSubmission, createVerifiedSubmission } from "../../lib/website/enquiry-contract.js";

// Only this non-secret, build-time mode may be public. Private Zoho settings
// belong to the Pages Function environment, never this browser module.
export const enquiryMode = process.env.NEXT_PUBLIC_ENQUIRY_MODE === "live" ? "live" : "demo";
export class EnquirySubmissionError extends Error {
  constructor(code) { super("Enquiry could not be submitted."); this.code = code; }
}
export async function submitEnquiry(values, { simulateFailure = false, mode = enquiryMode, fetchImpl = fetch, idempotencyKey } = {}) {
  if (mode !== "live") {
    await new Promise((resolve) => setTimeout(resolve, 650));
    if (simulateFailure) throw new Error("DEMO_SUBMISSION_FAILED");
    if (!values || typeof values !== "object") throw new Error("INVALID_ENQUIRY");
    return { mode: "demo", delivered: false, confirmed: false, stored: false };
  }
  return postSubmission(createSubmission(values, { idempotencyKey }), fetchImpl);
}

export async function submitVerifiedEnquiry(input, { mode = enquiryMode, fetchImpl = fetch, idempotencyKey, simulateFailure = false } = {}) {
  if (mode !== "live") return submitEnquiry(input, { mode: "demo", simulateFailure });
  return postSubmission(createVerifiedSubmission(input, { idempotencyKey }), fetchImpl);
}

async function postSubmission(packet, fetchImpl) {
  try {
    const response = await fetchImpl("/api/enquiries", {
      method: "POST", headers: { "content-type": "application/json" },
      credentials: "same-origin", body: JSON.stringify(packet),
      signal: AbortSignal.timeout(packet.version === 2 ? 30000 : 12000),
    });
    if (response.status === 429) throw new EnquirySubmissionError("rateLimited");
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const phaseCodes = { result_unknown: "resultUnknown", in_progress: "inProgress", idempotency_conflict: "idempotencyConflict", challenge_failed: "challengeFailed", invalid: "validation", provider_validation: "validation" };
      throw new EnquirySubmissionError(packet.version === 2 ? phaseCodes[result?.code] || "unavailable" : "unavailable");
    }
    if (result?.ok !== true || result?.delivered !== true) throw new EnquirySubmissionError(packet.version === 2 ? "resultUnknown" : "unavailable");
    return { mode: "live", delivered: true, confirmed: packet.version === 2 ? false : result.confirmed === true };
  } catch (error) {
    if (error instanceof EnquirySubmissionError) throw error;
    throw new EnquirySubmissionError(packet.version === 2 ? "resultUnknown" : "unavailable");
  }
}
