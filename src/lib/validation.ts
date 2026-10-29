import { z } from "zod";

export function isPasswordWithinBcryptLimit(password: string): boolean {
  return new TextEncoder().encode(password).byteLength <= 72;
}

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).refine(isPasswordWithinBcryptLimit, "كلمة المرور أطول من الحد المدعوم.")
});

export const bootstrapSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z
    .string()
    .min(14, "استخدم كلمة مرور من 14 حرفًا على الأقل.")
    .refine(isPasswordWithinBcryptLimit, "كلمة المرور أطول من الحد المدعوم."),
  bootstrapToken: z.string().min(32).max(256)
});
