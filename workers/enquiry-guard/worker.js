// Private service-binding Worker. Stores only HMACs, retry keys, counters and
// outcomes; no names, contact data, messages, credentials or Zoho business data.
const WINDOW = 10 * 60 * 1000;
const RETENTION = 24 * 60 * 60 * 1000;
const json = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
function authorized(request, env) {
  if (typeof env.ENQUIRY_GUARD_SECRET !== "string" || env.ENQUIRY_GUARD_SECRET.length < 32) return false;
  const expected = "Bearer " + env.ENQUIRY_GUARD_SECRET;
  const actual = request.headers.get("authorization") || "";
  if (!env.ENQUIRY_GUARD_SECRET || env.ENQUIRY_GUARD_SECRET.length < 32 || actual.length !== expected.length) return false;
  let different = 0; for (let i = 0; i < actual.length; i++) different |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return different === 0;
}
export class EnquiryGuard {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    if (!authorized(request, this.env)) return json(403, { code: "forbidden" });
    if (request.method !== "POST") return json(405, { code: "invalid" });
    const raw = await request.text();
    if (raw.length > 2048) return json(413, { code: "invalid" });
    let body; try { body = JSON.parse(raw); } catch { return json(400, { code: "invalid" }); }
    if (!body || typeof body.key !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(body.key)) return json(400, { code: "invalid" });
    const action = new URL(request.url).pathname;
    const now = Date.now();
    const result = await this.state.storage.transaction(async (tx) => {
      const key = "request:" + body.key;
      if (action === "/claim") {
        if (!/^[a-f0-9]{64}$/.test(body.ipHash || "") || !/^[a-f0-9]{64}$/.test(body.fingerprint || "")) return [400, { code: "invalid" }];
        const rateKey = "rate:" + body.ipHash;
        let rate = await tx.get(rateKey);
        if (!rate || rate.expiresAt <= now) rate = { count: 0, expiresAt: now + WINDOW };
        if (rate.count >= 5) return [429, { code: "rateLimited" }];
        rate.count++; await tx.put(rateKey, rate);
        const prior = await tx.get(key);
        if (prior && prior.expiresAt > now) {
          if (prior.fingerprint !== body.fingerprint) return [409, { code: "idempotency_conflict" }];
          if (prior.status === "completed") return [200, { status: "completed" }];
          return [409, { code: prior.status === "unknown" ? "result_unknown" : "in_progress" }];
        }
        const claimToken = crypto.randomUUID();
        await tx.put(key, { status: "pending", claimToken, fingerprint: body.fingerprint, expiresAt: now + RETENTION });
        return [200, { status: "acquired", claimToken }];
      }
      if (!["/complete", "/release"].includes(action)) return [404, { code: "invalid" }];
      const prior = await tx.get(key);
      if (!prior || prior.status !== "pending" || prior.claimToken !== body.claimToken) return [409, { code: "idempotency_conflict" }];
      if (action === "/release") { await tx.delete(key); return [200, { status: "released" }]; }
      if (!["completed", "unknown"].includes(body.status)) return [400, { code: "invalid" }];
      await tx.put(key, { ...prior, status: body.status });
      return [200, { status: body.status }];
    });
    if (await this.state.storage.getAlarm() === null) await this.state.storage.setAlarm(now + WINDOW);
    return json(result[0], result[1]);
  }
  async alarm() {
    const entries = await this.state.storage.list();
    const now = Date.now();
    for (const [key, value] of entries) if (value.expiresAt <= now) await this.state.storage.delete(key);
    if ((await this.state.storage.list({ limit: 1 })).size) await this.state.storage.setAlarm(now + WINDOW);
  }
}
const guardWorker = {
  async fetch(request, env) {
    if (!authorized(request, env)) return json(403, { code: "forbidden" });
    return env.STATE.get(env.STATE.idFromName("autoflow-intake")).fetch(request);
  },
};

export default guardWorker;
