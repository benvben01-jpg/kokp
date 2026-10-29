import type { UserRole } from "@prisma/client";
import { LogoutButton } from "@/components/logout-button";
import { requireCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const roleNames: Record<UserRole, string> = {
  SUPER_ADMIN: "مدير المنصة",
  FOLLOW_UP: "عضو متابعة",
  STUDENT: "طالب",
  SUPPORT: "فريق الدعم"
};

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">أ</div>
          <div>
            <p className="brand-name">أثر أكاديمي</p>
            <p className="brand-tagline">أثر في كل خطوة</p>
          </div>
        </div>
        <LogoutButton />
      </header>
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <p className="eyebrow">{roleNames[user.role]}</p>
        <h1 id="welcome-title">مرحبًا، {user.fullName}</h1>
        <p className="muted">تم إعداد أساس المنصة. ستظهر الأدوات المرتبطة بدورك عند تنفيذ مراحلها واعتمادها.</p>
        <p className="account-email" dir="ltr">{user.email}</p>
      </section>
      <section className="foundation-grid" aria-label="حالة المرحلة الأولى">
        <article className="foundation-card">
          <span className="status-dot" aria-hidden="true" />
          <h2>المصادقة</h2>
          <p>الجلسة صالحة، وحالة الحساب والدور جرى التحقق منهما من قاعدة البيانات.</p>
        </article>
        <article className="foundation-card">
          <span className="status-dot" aria-hidden="true" />
          <h2>قاعدة البيانات</h2>
          <p>تم تحميل ملف الحساب من PostgreSQL عبر Prisma.</p>
        </article>
        <article className="foundation-card foundation-card-muted">
          <span className="status-dot status-dot-pending" aria-hidden="true" />
          <h2>المراحل التالية</h2>
          <p>الاشتراكات، متابعة الطلاب، المساعد والكويزات لم تُفعّل في هذه المرحلة.</p>
        </article>
      </section>
      <footer className="dashboard-footer">المرحلة الأولى · أساس المنصة والمصادقة</footer>
    </main>
  );
}
