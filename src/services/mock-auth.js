// Frontend demonstration only. These values grant no real permissions.
const KEY = "autoflow.demo-session";
export const SESSION_EVENT = "autoflow:session";
export const DEMO_EMAIL = "demo@autoflow.example";
export const DEMO_PASSWORD = "DemoDrive123!";

export function readDemoSession() {
  try {
    const raw = window.localStorage.getItem(KEY) || window.sessionStorage.getItem(KEY);
    const value = raw ? JSON.parse(raw) : null;
    return value?.demo === true && typeof value.email === "string" && typeof value.name === "string" ? raw : null;
  } catch {
    return null;
  }
}

export async function simulateAuthRequest(email) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (email.toLowerCase() === "offline@autoflow.example") {
    throw new Error("The demo request could not be completed. Please try another email.");
  }
}

export async function loginDemo({ email, remember }) {
  await simulateAuthRequest(email);
  const session = JSON.stringify({ demo: true, email, name: "Alex Morgan" });
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
    (remember ? window.localStorage : window.sessionStorage).setItem(KEY, session);
  } catch {
    throw new Error("Browser storage is unavailable. Allow local storage to use the demo.");
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function logoutDemo() {
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
  } finally {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}
