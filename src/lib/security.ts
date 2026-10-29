import { createHmac, timingSafeEqual } from "node:crypto";

const DEVELOPMENT_HMAC_KEY = "athar-local-throttle-key-not-for-production";

export function constantTimeEqual(candidate: string, expected: string): boolean {
  const left = Buffer.from(candidate, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createLoginThrottleKey(email: string, clientAddress: string, secret?: string): string {
  const key = secret || process.env.AUTH_SECRET || DEVELOPMENT_HMAC_KEY;
  return createHmac("sha256", key).update(email + "\0" + clientAddress).digest("hex");
}
