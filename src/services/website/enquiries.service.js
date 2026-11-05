// Demo only. No fetch, browser storage, email, Zoho call, or database write.
// A live implementation must send to a validated server endpoint with anti-abuse
// protection and server-held Zoho credentials after configuration is approved.
export async function submitEnquiry(values, { simulateFailure = false } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 650));
  if (simulateFailure) throw new Error("DEMO_SUBMISSION_FAILED");
  if (!values || typeof values !== "object") throw new Error("INVALID_ENQUIRY");
  return { mode: "demo", delivered: false, confirmed: false, stored: false };
}
