import { ZohoError, unconfigured } from "./errors.js";
import { VERIFIED, checkedSetting } from "./verified.js";

const states = new Map();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function oauthSettings(env) {
  if (!env || !["ZOHO_CLIENT_ID", "ZOHO_CLIENT_SECRET", "ZOHO_REFRESH_TOKEN"].every((key) => typeof env[key] === "string" && env[key].trim())) throw unconfigured();
  checkedSetting(env, "ZOHO_ACCOUNTS_URL", VERIFIED.accountsOrigin);
  checkedSetting(env, "ZOHO_API_DOMAIN", VERIFIED.apiDomain);
  return { clientId: env.ZOHO_CLIENT_ID, clientSecret: env.ZOHO_CLIENT_SECRET, refreshToken: env.ZOHO_REFRESH_TOKEN };
}
async function stateFor(env) {
  const settings = oauthSettings(env);
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(settings)));
  const key = "autoflow:oauth:" + Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
  let state = states.get(key);
  if (!state) {
    if (states.size >= 8) states.delete(states.keys().next().value);
    state = { key, token: null, pending: null }; states.set(key, state);
  }
  return state;
}
async function cacheKey(state) { return state.key; }
function usable(token, now) {
  return token && typeof token.accessToken === "string" && token.accessToken.length <= 8192 && token.accessToken.length > 0
    && !/[\r\n]/.test(token.accessToken) && token.apiDomain === VERIFIED.apiDomain
    && Number.isFinite(token.expiresAt) && token.expiresAt > now + 5000;
}
export async function invalidateAccessToken(env, rejectedToken) {
  const state = await stateFor(env);
  if (state.token && state.token.accessToken !== rejectedToken) return;
  state.token = null; state.bypassKV = true;
  try { await env.ZOHO_TOKEN_CACHE?.delete(await cacheKey(state)); } catch { /* Optional cache; no provider/body logging. */ }
}
export async function getAccessToken(env, { fetchImpl = fetch, now = Date.now, sleep = delay } = {}) {
  const state = await stateFor(env);
  if (usable(state.token, now())) return state.token;
  if (state.pending) return state.pending;
  state.pending = (async () => {
    const key = await cacheKey(state);
    try {
      const cached = state.bypassKV ? null : await env.ZOHO_TOKEN_CACHE?.get(key, "json");
      if (usable(cached, now())) { state.token = cached; return cached; }
    } catch { /* Cache outages do not disclose or invalidate credentials. */ }
    const settings = oauthSettings(env);
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetchImpl(VERIFIED.accountsOrigin + "/oauth/v2/token", {
          method: "POST", redirect: "error",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ grant_type: "refresh_token", client_id: settings.clientId, client_secret: settings.clientSecret, refresh_token: settings.refreshToken }),
          signal: AbortSignal.timeout(5000),
        });
      } catch { throw new ZohoError("unavailable"); }
      if ((response.status === 429 || response.status >= 500) && attempt < 2) { await sleep(250 * 2 ** attempt); continue; }
      let body; try { body = await response.json(); } catch { throw new ZohoError("unavailable"); }
      const expiresIn = Number(body.expires_in);
      if (!response.ok || body.error || typeof body.access_token !== "string" || /[\r\n]/.test(body.access_token)
        || !body.access_token.length || body.access_token.length > 8192 || body.api_domain !== VERIFIED.apiDomain
        || !Number.isFinite(expiresIn) || expiresIn <= 60 || expiresIn > 86400) throw new ZohoError("unavailable");
      // API host is taken from the validated token response, not a user URL.
      const token = { accessToken: body.access_token, apiDomain: body.api_domain, expiresAt: now() + (expiresIn - 60) * 1000 };
      state.token = token; state.bypassKV = false;
      try { await env.ZOHO_TOKEN_CACHE?.put(key, JSON.stringify(token), { expirationTtl: Math.max(60, Math.floor(expiresIn - 60)) }); } catch { /* Optional short-lived cache only. */ }
      return token;
    }
    throw new ZohoError("unavailable");
  })();
  try { return await state.pending; } finally { state.pending = null; }
}
