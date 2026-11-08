import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dictionaries } from "../src/lib/website/dictionaries.js";
import { locales, mainNavigation, websitePages, pagePath, siteOrigin } from "../src/config/website.js";
import { vehicles, services, solutions, parts } from "../src/lib/mock-data/website.js";
import { filterVehicles } from "../src/services/website/vehicles.service.js";
import { websiteMetadata } from "../src/lib/website/metadata.js";

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
