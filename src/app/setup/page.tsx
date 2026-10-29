import Link from "next/link";
import { AdminBootstrapForm } from "@/components/admin-bootstrap-form";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <main className="page-shell">
      <section className="auth-card setup-card" aria-labelledby="setup-title">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">أ</div>
          <div>
            <p className="brand-name">أثر أكاديمي</p>
            <p className="brand-tagline">إعداد آمن لمرة واحدة</p>
          </div>
        </div>
        <div className="section-copy">
          <p className="eyebrow">التهيئة الأولى</p>
          <h1 id="setup-title">إنشاء حساب المدير</h1>
          <p className="muted">تُتاح هذه الخطوة فقط قبل إنشاء أول مدير، وتحتاج إلى رمز أُضيف إلى أسرار بيئة التشغيل.</p>
        </div>
        <AdminBootstrapForm />
        <p className="auth-footnote"><Link className="text-link" href="/login">العودة إلى تسجيل الدخول</Link></p>
      </section>
    </main>
  );
}
