/**
 * Data Access Layer for the signed-in user.
 *
 * Every page and server action that touches personal data goes through
 * `requireUser()` (or `requireAdmin()`), so access control lives in one place
 * instead of being scattered across the app.
 */
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db, schema } from "@/db";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

/** Returns the signed-in user, or `null`. Cached for one request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & { role?: string | null };
  return { id: u.id, name: u.name, email: u.email, isAdmin: u.role === "admin" };
});

/** Returns the signed-in user or redirects to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Like `requireUser`, but also sends users who have not onboarded yet to onboarding. */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  if (!settings?.onboardedAt) redirect("/onboarding");
  return user;
}

/** Only admins get through; everyone else sees a 404-style redirect. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isAdmin) redirect("/learn");
  return user;
}

export const getSettings = cache(async (userId: string) => {
  return (
    db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId)).get() ??
    null
  );
});
