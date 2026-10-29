import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">أ</div>
          <div>
            <p className="brand-name">أثر أكاديمي</p>
            <p className="brand-tagline">أثر في كل خطوة</p>
          </div>
        </div>
        <div className="section-copy">
          <p className="eyebrow">مساحتك التعليمية</p>
          <h1 id="login-title">أهلًا بعودتك</h1>
          <p className="muted">سجّل الدخول للمتابعة إلى حسابك.</p>
        </div>
        <LoginForm />
        <p className="auth-footnote">تجهيز أول حساب إداري؟ <Link className="text-link" href="/setup">ابدأ الإعداد الأولي</Link></p>
      </section>
      <p className="page-footer">أثر أكاديمي <span aria-hidden="true">·</span> الصف الثالث الثانوي</p>
    </main>
  );
}
