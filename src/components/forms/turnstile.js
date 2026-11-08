"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function Turnstile({ siteKey, action, locale, resetKey, onToken }) {
  const container = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready || !window.turnstile || !container.current) return;
    const widget = window.turnstile.render(container.current, {
      sitekey: siteKey, action, language: locale, size: "flexible",
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => { onToken(""); return true; },
    });
    return () => { window.turnstile?.remove(widget); };
  }, [ready, siteKey, action, locale, resetKey, onToken]);
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => onToken("")} /><div ref={container} className="min-h-16 min-w-0" /></>;
}
