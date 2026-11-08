export class ZohoError extends Error {
  constructor(code, { status = 503, uncertain = false, providerCode, field } = {}) {
    super("The enquiry service could not complete this request.");
    this.code = code; this.status = status; this.uncertain = uncertain;
    this.providerCode = providerCode; this.field = field;
  }
}
export const unconfigured = () => new ZohoError("integration_unconfigured");
export const invalid = (field) => new ZohoError("invalid", { status: 422, field });
export function safeFailure(error) {
  return error instanceof ZohoError ? error : new ZohoError("unavailable");
}
