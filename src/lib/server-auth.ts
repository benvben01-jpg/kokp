import type { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;

  return prisma.user.findFirst({
    where: { id, isActive: true },
    select: { id: true, fullName: true, email: true, role: true }
  });
}

export async function requireCurrentUser(allowedRoles?: readonly UserRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(user.role)) notFound();
  return user;
}
