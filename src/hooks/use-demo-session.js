"use client";

import { useMemo, useSyncExternalStore } from "react";
import { readDemoSession, SESSION_EVENT } from "@/services/mock-auth";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

export default function useDemoSession() {
  const raw = useSyncExternalStore(subscribe, readDemoSession, () => undefined);
  return useMemo(() => ({ ready: raw !== undefined, session: raw ? JSON.parse(raw) : null }), [raw]);
}
