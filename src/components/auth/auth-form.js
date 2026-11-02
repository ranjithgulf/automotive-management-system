"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/icon";
import { inputClass, primaryButton, Notice } from "@/components/ui/primitives";
import { DEMO_EMAIL, DEMO_PASSWORD, loginDemo, simulateAuthRequest } from "@/services/mock-auth";
import { validateAuth } from "@/lib/validation";

const copy = {
  login: { title: "Welcome back", text: "Sign in to keep your business moving.", button: "Login", loading: "Signing in…" },
  register: { title: "Create your account", text: "Take the first step toward a connected workspace.", button: "Create Account", loading: "Checking details…" },
  forgot: { title: "Forgot your password?", text: "No worries. Enter your email to preview the recovery flow.", button: "Send reset instructions", loading: "Submitting…" },
};

function Field({ name, label, type = "text", value, onChange, error, autoComplete, placeholder, disabled }) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">{label}</label><div className="relative"><input id={name} name={name} type={password && visible ? "text" : type} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} disabled={disabled} required aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} className={`${inputClass} ${password ? "pe-12" : ""} ${error ? "border-rose-400" : ""}`} />{password && <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-xl text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-teal-600"><Icon name={visible ? "eyeOff" : "eye"} /></button>}</div>{error && <p id={`${name}-error`} className="mt-1.5 text-xs text-rose-600">{error}</p>}</div>;
}

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const info = copy[mode];
  function update(event) {
    const { name, value } = event.target;
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: undefined }));
    setMessage(null);
  }
  async function submit(event) {
    event.preventDefault();
    setMessage(null);
    const nextErrors = validateAuth(values, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await loginDemo({ email: values.email.trim(), remember });
        router.replace("/dashboard");
      } else {
        await simulateAuthRequest(values.email.trim());
        setMessage({ text: mode === "register" ? "Your details passed the demo validation. No account or permissions were created. Return to Login to explore the demo." : "Recovery request preview complete. In the live application, an eligible email would receive reset instructions. No email was sent." });
        setValues((old) => ({ ...old, password: "", confirm: "" }));
      }
    } catch (error) {
      setMessage({ error: true, text: error.message });
    } finally {
      setLoading(false);
    }
  }
  return <><div className="mb-8"><span className="text-xs font-semibold tracking-[0.16em] text-teal-700 uppercase">Your connected workspace</span><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{info.title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{info.text}</p></div>
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={loading}>
      {message && <Notice error={message.error}>{message.text}</Notice>}
      {mode === "register" && <Field name="name" label="Full name" value={values.name} onChange={update} error={errors.name} autoComplete="name" placeholder="Alex Morgan" disabled={loading} />}
      <Field name="email" label={mode === "register" ? "Work email" : "Email address"} type="email" value={values.email} onChange={update} error={errors.email} autoComplete="email" placeholder="you@company.com" disabled={loading} />
      {mode !== "forgot" && <Field name="password" label="Password" type="password" value={values.password} onChange={update} error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "At least 8 characters, letters & numbers" : "Enter your password"} disabled={loading} />}
      {mode === "register" && <Field name="confirm" label="Confirm password" type="password" value={values.confirm} onChange={update} error={errors.confirm} autoComplete="new-password" placeholder="Re-enter your password" disabled={loading} />}
      {mode === "login" && <div className="flex items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 rounded border-slate-300 accent-teal-700" disabled={loading} />Remember me</label><Link href="/forgot-password" className="font-semibold text-teal-700 hover:underline">Forgot password?</Link></div>}
      {mode === "register" && <p className="text-xs leading-5 text-slate-500">This is a frontend preview. Registration does not create an account or assign administrator or staff access.</p>}
      <button type="submit" disabled={loading} className={`${primaryButton} w-full`}>{loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" /> : null}{loading ? info.loading : info.button}{!loading && <Icon name="arrow" className="size-4 rtl:rotate-180" />}</button>
    </form>
    {mode === "login" && <><div className="relative my-6 flex items-center gap-4"><span className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">JUST EXPLORING?</span><span className="h-px flex-1 bg-slate-200" /></div><button type="button" disabled={loading} onClick={() => { setValues({ name: "", email: DEMO_EMAIL, password: DEMO_PASSWORD, confirm: "" }); setErrors({}); setMessage(null); }} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:border-teal-600 hover:bg-teal-50 disabled:opacity-60">Fill demo credentials</button><p className="mt-3 text-center text-xs leading-5 text-slate-400">Any valid email and 8+ character password opens the demo.<br />Use invented details. Passwords are never stored.</p></>}
    <p className="mt-7 text-center text-sm text-slate-500">{mode === "login" ? <>New to AutoFlow? <Link href="/create-account" className="font-semibold text-teal-700 hover:underline">Create Account</Link></> : <Link href="/login" className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline"><Icon name="arrow" className="size-4 rotate-180" />Back to Login</Link>}</p>
  </>;
}
