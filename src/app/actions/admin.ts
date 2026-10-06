"use server";
/**
 * Admin-only actions. Every action checks the admin role itself; hiding a
 * button in the UI is never enough.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { getUserById } from "@/lib/admin";
import { createResetToken } from "@/lib/password-reset";
import { requireAdmin } from "@/lib/session";

const userId = z.string().min(1).max(100);

/** Creates a one-time reset link. Returns the path; the page adds the origin. */
export async function createResetLinkAction(id: string): Promise<{ path: string } | { error: string }> {
  await requireAdmin();
  const target = getUserById(userId.parse(id));
  if (!target) return { error: "not-found" };
  return { path: `/reset/${createResetToken(target.id)}` };
}

export async function setRoleAction(id: string, role: "user" | "admin"): Promise<void> {
  const admin = await requireAdmin();
  const target = userId.parse(id);
  // An admin cannot remove their own admin role by accident.
  if (target === admin.id) return;
  db.update(schema.user).set({ role: z.enum(["user", "admin"]).parse(role) }).where(eq(schema.user.id, target)).run();
  revalidatePath("/admin");
}

export async function deleteUserAction(id: string): Promise<void> {
  const admin = await requireAdmin();
  const target = userId.parse(id);
  if (target === admin.id) return;
  db.delete(schema.user).where(eq(schema.user.id, target)).run();
  revalidatePath("/admin");
}
