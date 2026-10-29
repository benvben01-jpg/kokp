import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { clearLoginAttempts, recordLoginFailure, reserveLoginAttempt } from "@/lib/login-throttle";
import { createLoginThrottleKey } from "@/lib/security";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET?.trim()) {
  throw new Error("AUTH_SECRET must be configured in production.");
}

let dummyHash: string | undefined;

async function getDummyHash(): Promise<string> {
  if (!dummyHash) dummyHash = await bcrypt.hash("athar-invalid-account-check", 12);
  return dummyHash;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "بيانات الدخول",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const forwardedAddress = request.headers["x-forwarded-for"]?.split(",")[0]?.trim().slice(0, 64) || "unknown";
        const keyHash = createLoginThrottleKey(parsed.data.email, forwardedAddress);
        const allowed = await reserveLoginAttempt(keyHash);
        if (!allowed) {
          await bcrypt.compare(parsed.data.password, await getDummyHash());
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, fullName: true, email: true, passwordHash: true, isActive: true }
        });
        const passwordHash = user?.passwordHash ?? (await getDummyHash());
        const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);

        if (!user || !user.isActive || !passwordMatches) {
          await recordLoginFailure(keyHash);
          return null;
        }
        await clearLoginAttempts(keyHash);
        return { id: user.id, name: user.fullName, email: user.email };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    }
  }
};
