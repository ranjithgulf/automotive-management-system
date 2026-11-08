import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

test("deployment stays static with no retired intake Function or Worker", () => {
  assert.match(readFileSync("next.config.mjs", "utf8"), /output: "export"/);
  assert.equal(readFileSync(".node-version", "utf8").trim(), "24");
  for (const file of ["functions/api/enquiries.js", "public/_routes.json", "workers/enquiry-guard/worker.js", "server/zoho/oauth.js"]) assert.equal(existsSync(file), false, file);
});

test("safe templates and ignored credentials/generated files stay out of Git", () => {
  const names = [];
  for (const line of readFileSync(".env.example", "utf8").split("\n").filter(line => /^[A-Z_]+=/.test(line))) {
    const key = line.slice(0, line.indexOf("=")); names.push(key);
    assert.ok(line.trimEnd() === key + "=", "Example variable " + key + " must be empty; value redacted.");
  }
  assert.deepEqual(names.sort(), ["DATABASE_URL", "SITE_URL"]);
  const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n");
  assert.ok(!tracked.some(file => /(^|\/)(\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$/.test(file) && file !== ".env.example"));
  assert.ok(!tracked.some(file => /(^|\/)(\.next|out|node_modules|\.wrangler)\//.test(file)));
  for (const file of [".env", ".env.local", ".env.production", "nested/.env.local", ".dev.vars", ".wrangler/state/example", ".next/cache/example", "out/index.html"]) assert.equal(execFileSync("git", ["check-ignore", file], { encoding: "utf8" }).trim(), file);
});
