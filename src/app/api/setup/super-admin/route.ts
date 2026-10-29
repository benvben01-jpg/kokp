import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { constantTimeEqual } from "@/lib/security";
import { bootstrapSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

class SetupClosedError extends Error {}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function json(body: Record<string, unknown>, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "الطلب غير مسموح." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: "صيغة الطلب غير مدعومة." }, 415);
  }

  const configuredToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  if (!configuredToken || configuredToken.length < 32) {
    return json({ error: "إعداد المدير الأول غير مفعّل في بيئة التشغيل." }, 503);
  }

  let raw: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 8192) return json({ error: "الطلب أكبر من الحد المسموح." }, 413);
    raw = JSON.parse(body);
  } catch {
    return json({ error: "تعذر قراءة بيانات الطلب." }, 400);
  }

  const parsed = bootstrapSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "تحقق من الاسم والبريد وكلمة المرور ورمز الإعداد." }, 400);
  if (!constantTimeEqual(parsed.data.bootstrapToken, configuredToken)) {
    return json({ error: "تعذر إتمام الإعداد الأولي." }, 403);
  }

  const passwordHash = await hash(parsed.data.password, 12);
  try {
    await prisma.$transaction(
      async (tx) => {
        const existingAdmin = await tx.user.findFirst({
          where: { role: UserRole.SUPER_ADMIN },
          select: { id: true }
        });
        if (existingAdmin) throw new SetupClosedError();

        await tx.adminBootstrap.create({ data: { key: "initial-super-admin" } });
        await tx.user.create({
          data: {
            fullName: parsed.data.fullName,
            email: parsed.data.email,
            passwordHash,
            role: UserRole.SUPER_ADMIN
          }
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    return json({ success: true }, 201);
  } catch (error) {
    if (error instanceof SetupClosedError) return json({ error: "الإعداد الأولي مغلق." }, 409);
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
      return json({ error: "الإعداد الأولي مغلق أو تعذر استخدام هذا البريد." }, 409);
    }
    return json({ error: "تعذر إنشاء الحساب الآن." }, 500);
  }
}
