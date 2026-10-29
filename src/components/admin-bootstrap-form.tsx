"use client";

import { FormEvent, useState } from "react";

export function AdminBootstrapForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/setup/super-admin", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          bootstrapToken: String(form.get("bootstrapToken") ?? "")
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setIsError(true);
        setMessage(typeof result.error === "string" ? result.error : "تعذر إتمام الإعداد الأولي.");
        return;
      }
      formElement.reset();
      setIsError(false);
      setMessage("تم إنشاء حساب المدير الأول. انتقل إلى تسجيل الدخول.");
    } catch {
      setIsError(true);
      setMessage("تعذر الاتصال بالخادم. تحقق من قاعدة البيانات والإعدادات.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="fullName">الاسم الكامل</label>
      <input className="text-input" id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={120} />
      <label className="field-label" htmlFor="setupEmail">البريد الإلكتروني</label>
      <input className="text-input" id="setupEmail" name="email" type="email" autoComplete="email" dir="ltr" required maxLength={254} />
      <label className="field-label" htmlFor="setupPassword">كلمة مرور قوية (14 حرفًا على الأقل)</label>
      <input className="text-input" id="setupPassword" name="password" type="password" autoComplete="new-password" required minLength={14} />
      <label className="field-label" htmlFor="bootstrapToken">رمز الإعداد المؤقت</label>
      <input className="text-input" id="bootstrapToken" name="bootstrapToken" type="password" autoComplete="off" dir="ltr" required minLength={32} />
      <p className="hint">أدخل الرمز الموجود في مخزن أسرار بيئة التشغيل. لا ترسله في المحادثة أو تضعه في المستودع.</p>
      {message ? <p className={isError ? "message message-error" : "message message-success"} role="status">{message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "جارٍ إنشاء الحساب…" : "إنشاء المدير الأول"}
      </button>
    </form>
  );
}
