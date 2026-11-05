import { submitEnquiry } from "./enquiries.service.js";
export async function submitAppointmentEnquiry(values, options) {
  return submitEnquiry({ ...values, requestKind: "service-enquiry" }, options);
}
