import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dictionaries } from "../src/lib/website/dictionaries.js";
import { locales, mainNavigation, websitePages, pagePath, siteOrigin } from "../src/config/website.js";
import { vehicles, services, solutions, parts } from "../src/lib/mock-data/website.js";
import { filterVehicles } from "../src/services/website/vehicles.service.js";
import { formFields, validateEnquiry, normalizePhone } from "../src/lib/website/forms.js";
import { websiteMetadata } from "../src/lib/website/metadata.js";
import { submitEnquiry } from "../src/services/website/enquiries.service.js";
import { submitAppointmentEnquiry } from "../src/services/website/appointments.service.js";

function paths(value, prefix = "") {
  return Object.entries(value).flatMap(([key, item]) => typeof item === "object" ? paths(item, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
}
test("English and Arabic have identical, populated content keys", () => {
  assert.deepEqual(paths(dictionaries.en), paths(dictionaries.ar));
  for (const locale of locales) {
    const visit = (value) => { for (const item of Object.values(value)) { if (typeof item === "object") visit(item); else assert.ok(typeof item === "string" && item.trim()); } };
    visit(dictionaries[locale]);
  }
  assert.match(dictionaries.ar.home.title, /\p{Script=Arabic}/u);
});

test("public navigation and every vehicle have unique locale-aware routes", () => {
  assert.equal(mainNavigation.length, 9);
  for (const locale of locales) {
    const routes = ["home", ...websitePages, ...vehicles.map((v) => `vehicles/${v.id}`)].map((p) => pagePath(locale, p));
    assert.equal(routes.length, new Set(routes).size);
    for (const route of routes) assert.match(route, new RegExp(`^/${locale}/`));
  }
  assert.equal(new Set(vehicles.map((v) => v.reference)).size, vehicles.length);
});

test("catalog filters combine and sorting respects displayed prices", () => {
  assert.equal(filterVehicles(vehicles, { search: "camry" })[0].id, "camry-hybrid");
  assert.ok(filterVehicles(vehicles, { brand: "Toyota", condition: "new" }).every((v) => v.brand === "Toyota" && v.condition === "new"));
  assert.equal(filterVehicles(vehicles, { search: "does-not-exist" }).length, 0);
  assert.ok(filterVehicles(vehicles, { range: "middle" }).every((v) => v.price >= 150000 && v.price <= 250000));
  const sorted = filterVehicles(vehicles, { sort: "low" });
  assert.ok(sorted.every((v, i) => i === 0 || sorted[i - 1].price <= v.price));
});

test("mock editorial data contains all requested verticals and service categories", () => {
  assert.equal(solutions.length, 10);
  assert.equal(services.length, 9);
  assert.equal(parts.length, 4);
  for (const item of [...solutions, ...services]) {
    assert.ok(item.title.en && item.title.ar && item.description.en && item.description.ar && item.benefit.en && item.benefit.ar);
  }
  for (const item of [...vehicles, ...solutions, ...parts]) assert.ok(existsSync(`public/images/${item.image}.webp`));
});

const options = { categories: [{ value: "general" }], types: [{ value: "general" }], methods: [{ value: "email" }], branches: [{ value: "dubai" }], services: [{ value: "maintenance" }] };
const valid = { interest: "Toyota Camry", category: "general", subject: "A demonstration question", name: "Huda Al Suwaidi", email: "huda@example.com", phone: "+971 50 555 0101", type: "general", message: "Please share the next steps for a vehicle enquiry.", method: "email", brand: "Toyota", model: "Camry", branch: "dubai", service: "maintenance", date: "2026-11-03", time: "10:30" };
test("all enquiry forms validate required fields, choices and contact information", () => {
  for (const kind of ["contact", "vehicle", "drive", "quotation", "service", "support"]) {
    const fields = formFields(kind);
    assert.deepEqual(validateEnquiry(valid, fields, options, "2026-11-02"), {});
    assert.ok(validateEnquiry({}, fields, options, "2026-11-02").name);
    assert.equal(validateEnquiry({ ...valid, email: "invalid" }, fields, options, "2026-11-02").email, "invalidEmail");
    assert.equal(validateEnquiry({ ...valid, phone: "abc" }, fields, options, "2026-11-02").phone, "invalidPhone");
  }
  assert.equal(validateEnquiry({ ...valid, type: "unsupported" }, formFields("contact"), options, "2026-11-02").type, "invalidChoice");
  assert.equal(validateEnquiry({ ...valid, date: "2026-02-31" }, formFields("service"), options, "2026-11-02").date, "invalidDate");
  assert.equal(validateEnquiry({ ...valid, date: "2026-11-01" }, formFields("drive"), options, "2026-11-02").date, "invalidDate");
});

test("mock enquiries do not claim delivery, storage or appointment confirmation", async () => {
  assert.deepEqual(await submitEnquiry(valid), { mode: "demo", delivered: false, confirmed: false, stored: false });
  assert.equal((await submitAppointmentEnquiry(valid)).confirmed, false);
  await assert.rejects(submitEnquiry(valid, { simulateFailure: true }), /DEMO_SUBMISSION_FAILED/);
});

test("Arabic-Indic phone numbers validate without changing the visitor's input", () => {
  const phone = "+\u0669\u0667\u0661 \u0665\u0660 \u0665\u0665\u0665 \u0660\u0661\u0660\u0661";
  assert.equal(normalizePhone(phone), "+971 50 555 0101");
  assert.deepEqual(validateEnquiry({ ...valid, phone }, formFields("contact"), options, "2026-11-02"), {});
});

test("SEO does not invent an origin and uses the configured locale and vehicle path", () => {
  const previous = process.env.SITE_URL;
  try {
    delete process.env.SITE_URL;
    assert.equal(websiteMetadata("en").alternates, undefined);
    process.env.SITE_URL = "https://autoflow.example";
    const metadata = websiteMetadata("ar", "vehicles", vehicles[0]);
    assert.equal(metadata.alternates.canonical, "https://autoflow.example/ar/vehicles/land-cruiser-gxr/");
    assert.equal(metadata.alternates.languages.en, "https://autoflow.example/en/vehicles/land-cruiser-gxr/");
    assert.equal(metadata.openGraph.locale, "ar_AE");
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("old internal routes, mock workflows and operational APIs have been removed", () => {
  for (const path of ["src/app/(auth)", "src/app/(workspace)", "src/app/api/sales", "src/services/sales", "src/components/workspace", "src/components/sales"]) assert.equal(existsSync(path), false, path);
});

test("public site origin rejects unsafe or non-origin configuration", () => {
  const previous = process.env.SITE_URL;
  try {
    for (const value of ["", "not-a-url", "javascript:alert(1)", "file:///tmp/site", "https://user:password@autoflow.example", "https://autoflow.example/en/", "https://autoflow.example/?token=private", "https://autoflow.example/#private"]) {
      process.env.SITE_URL = value;
      assert.equal(siteOrigin(), null);
      assert.equal(websiteMetadata("en").alternates, undefined);
    }
    for (const [value, expected] of [["https://autoflow.example/", "https://autoflow.example"], ["http://localhost:3000", "http://localhost:3000"]]) {
      process.env.SITE_URL = value;
      assert.equal(siteOrigin(), expected);
    }
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("production metadata uses HTTPS origins and keeps loopback previews available", () => {
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = "http://autoflow.example";
    assert.equal(siteOrigin(), null);
    process.env.SITE_URL = "http://127.0.0.1:4317";
    assert.equal(siteOrigin(), "http://127.0.0.1:4317");
  } finally {
    if (previous === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = previous;
  }
});

test("every localized page has unique factual metadata and consistent branded sharing assets", () => {
  const previous = process.env.SITE_URL;
  try {
    process.env.SITE_URL = "https://autoflow.example";
    const titles = new Set(), descriptions = new Set();
    for (const locale of locales) {
      const entries = ["home", ...websitePages].map((page) => websiteMetadata(locale, page));
      entries.push(...vehicles.map((v) => websiteMetadata(locale, "vehicles", v)));
      for (const meta of entries) {
        assert.ok(meta.title && meta.description);
        assert.ok(!titles.has(meta.title), meta.title); titles.add(meta.title);
        assert.ok(!descriptions.has(meta.description), meta.description); descriptions.add(meta.description);
        assert.match(meta.alternates.canonical, /^https:\/\/autoflow\.example\/(en|ar)\//);
        assert.deepEqual(meta.robots, { index: true, follow: true });
        assert.equal(meta.openGraph.images[0].width, 1200);
        assert.equal(meta.openGraph.images[0].height, 630);
        assert.equal(meta.twitter.images[0], meta.openGraph.images[0].url);
      }
    }
  } finally {
    if (previous === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = previous;
  }
});
