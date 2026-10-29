import { prisma } from "@/lib/prisma";
import { createLoginThrottleKey } from "@/lib/security";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function reserveLoginAttempt(keyHash: string): Promise<boolean> {
  const now = new Date();
  const windowFloor = new Date(now.getTime() - WINDOW_MS);

  await prisma.loginThrottle.upsert({
    where: { keyHash },
    create: { keyHash, failures: 0, windowStartedAt: now },
    update: {}
  });

  await prisma.loginThrottle.updateMany({
    where: {
      keyHash,
      OR: [{ windowStartedAt: { lt: windowFloor } }, { blockedUntil: { lte: now } }]
    },
    data: { failures: 0, windowStartedAt: now, blockedUntil: null }
  });

  const reservation = await prisma.loginThrottle.updateMany({
    where: {
      keyHash,
      failures: { lt: MAX_ATTEMPTS },
      OR: [{ blockedUntil: null }, { blockedUntil: { lte: now } }]
    },
    data: { failures: { increment: 1 } }
  });

  return reservation.count === 1;
}

export async function recordLoginFailure(keyHash: string): Promise<void> {
  const now = new Date();
  await prisma.loginThrottle.updateMany({
    where: { keyHash, failures: { gte: MAX_ATTEMPTS }, blockedUntil: null },
    data: { blockedUntil: new Date(now.getTime() + WINDOW_MS) }
  });
}

export async function clearLoginAttempts(keyHash: string): Promise<void> {
  const now = new Date();
  await prisma.loginThrottle.updateMany({
    where: { keyHash },
    data: { failures: 0, windowStartedAt: now, blockedUntil: null }
  });
}
