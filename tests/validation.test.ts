import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapSchema, isPasswordWithinBcryptLimit, loginSchema } from "../src/lib/validation.ts";
import { constantTimeEqual } from "../src/lib/security.ts";

const setupToken = "0123456789abcdef0123456789abcdef";

test("login trims and normalizes email while preserving password", () => {
  const result = loginSchema.safeParse({ email: "  STUDENT@EXAMPLE.COM ", password: "a Valid Password" });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "student@example.com");
    assert.equal(result.data.password, "a Valid Password");
  }
});

test("login rejects an invalid email and an empty password", () => {
  assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "user@example.com", password: "" }).success, false);
});

test("bootstrap requires a long password, valid email, and a long token", () => {
  const valid = { fullName: "مدير أثر", email: "ADMIN@example.com", password: "A-long-safe-password-2026", bootstrapToken: setupToken };
  const parsed = bootstrapSchema.safeParse(valid);
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.email, "admin@example.com");
  assert.equal(bootstrapSchema.safeParse({ ...valid, password: "short" }).success, false);
  assert.equal(bootstrapSchema.safeParse({ ...valid, bootstrapToken: "short" }).success, false);
});

test("bcrypt byte limit does not silently truncate multibyte passwords", () => {
  assert.equal(isPasswordWithinBcryptLimit("a".repeat(72)), true);
  assert.equal(isPasswordWithinBcryptLimit("a".repeat(73)), false);
  assert.equal(isPasswordWithinBcryptLimit("ع".repeat(37)), false);
});

test("bootstrap token comparison rejects unequal values and lengths", () => {
  assert.equal(constantTimeEqual(setupToken, setupToken), true);
  assert.equal(constantTimeEqual(setupToken, "x".repeat(32)), false);
  assert.equal(constantTimeEqual(setupToken, "short"), false);
});
