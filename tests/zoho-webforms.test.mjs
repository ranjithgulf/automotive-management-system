import test from "node:test";
import assert from "node:assert/strict";
import { zohoWebforms, resolveZohoWebformKind } from "../src/config/zohoWebforms.ts";

test("published webforms preserve all seven approved distinct destinations", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(zohoWebforms).map(([kind, form]) => [kind, form.url])), {
    contact: "https://zcform.com/U93KB", vehicle: "https://zcform.com/Y9rnh",
    quotation: "https://zcform.com/1ZkiW", drive: "https://zcform.com/g6Csv",
    "trade-in": "https://zcform.com/aBJ42", service: "https://zcform.com/hpFYm", support: "https://zcform.com/CkrU4",
  });
});

test("contact intent selects published sales forms without overriding service or support routes", () => {
  for (const kind of ["vehicle", "quotation", "drive", "trade-in"]) {
    assert.equal(resolveZohoWebformKind("contact", kind), kind);
    assert.equal(resolveZohoWebformKind("service", kind), "service");
    assert.equal(resolveZohoWebformKind("support", kind), "support");
  }
  assert.equal(resolveZohoWebformKind(), "contact");
  assert.equal(resolveZohoWebformKind("contact", "https://untrusted.example"), "contact");
  assert.equal(resolveZohoWebformKind("__proto__"), "contact");
});
