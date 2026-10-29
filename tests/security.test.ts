import assert from "node:assert/strict";
import test from "node:test";
import { constantTimeEqual, createLoginThrottleKey } from "../src/lib/security.ts";

test("constant-time comparison accepts identical tokens", () => {
  assert.equal(constantTimeEqual("a".repeat(32), "a".repeat(32)), true);
});

test("constant-time comparison rejects wrong tokens and lengths", () => {
  assert.equal(constantTimeEqual("a".repeat(32), "b".repeat(32)), false);
  assert.equal(constantTimeEqual("a".repeat(32), "short"), false);
});

test("login throttle identifiers are stable HMACs without storing raw identifiers", () => {
  const first = createLoginThrottleKey("student@example.com", "192.0.2.8", "test-key");
  assert.equal(first, createLoginThrottleKey("student@example.com", "192.0.2.8", "test-key"));
  assert.notEqual(first, createLoginThrottleKey("student@example.com", "192.0.2.9", "test-key"));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first.includes("student@example.com"), false);
});
