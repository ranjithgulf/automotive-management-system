// Exact user-supplied published URLs; titles verified from their hosted forms.
// Heights are conservative presentation settings, not Zoho IDs or field mappings.
export const zohoWebforms = Object.freeze({
  contact: Object.freeze({ url: "https://zcform.com/U93KB", title: "AutoFlow GCC - General Enquiry", height: 1000 }),
  vehicle: Object.freeze({ url: "https://zcform.com/Y9rnh", title: "AutoFlow GCC - Vehicle Enquiry", height: 950 }),
  quotation: Object.freeze({ url: "https://zcform.com/1ZkiW", title: "AutoFlow GCC - Quotation Request", height: 950 }),
  drive: Object.freeze({ url: "https://zcform.com/g6Csv", title: "AutoFlow GCC - Test Drive Request", height: 950 }),
  "trade-in": Object.freeze({ url: "https://zcform.com/aBJ42", title: "AutoFlow GCC - Trade-in Request", height: 1000 }),
  service: Object.freeze({ url: "https://zcform.com/hpFYm", title: "AutoFlow GCC - Service Booking", height: 850 }),
  support: Object.freeze({ url: "https://zcform.com/CkrU4", title: "AutoFlow GCC - Support Request", height: 750 }),
});

export function resolveZohoWebformKind(kind = "contact", requested = "") {
  return kind === "contact" && ["vehicle", "drive", "quotation", "trade-in"].includes(requested)
    ? requested : Object.hasOwn(zohoWebforms, kind) ? kind : "contact";
}
