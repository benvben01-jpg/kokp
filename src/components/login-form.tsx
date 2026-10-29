"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        redirect: false
      });
      if (!result || result.error) {
        setError("بيانات الدخول غير صحيحة أو الحساب غير مفعّل.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("تعذر تسجيل الدخول الآن. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="email">البريد الإلكتروني</label>
      <input className="text-input" id="email" name="email" type="email" autoComplete="username" dir="ltr" required maxLength={254} />
      <label className="field-label" htmlFor="password">كلمة المرور</label>
      <input className="text-input" id="password" name="password" type="password" autoComplete="current-password" required />
      {error ? <p className="message message-error" role="alert">{error}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "جارٍ التحقق…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
