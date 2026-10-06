/**
 * Password resets without e-mail.
 *
 * An admin creates a one-time link for a user and hands it over personally.
 * The link contains a random token; only its SHA-256 hash is stored, so a
 * database leak does not leak usable links. Links expire after 24 hours and
 * work once. Using a link signs the user out everywhere.
 */
import "server-only";
import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { auth } from "./auth";

const VALID_MS = 24 * 60 * 60 * 1000;

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

/** Creates a reset token for a user and returns the plain token (shown once). */
export function createResetToken(userId: string): string {
  const token = crypto.randomBytes(32).toString("base64url");
  // Older unused links for this user stop working.
  db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId)).run();
  db.insert(schema.passwordResetTokens)
    .values({
      id: crypto.randomUUID(),
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + VALID_MS),
    })
    .run();
  return token;
}

/** Returns the token row if the token is valid, unused and not expired. */
export function findValidToken(token: string) {
  return (
    db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.tokenHash, sha256(token)),
          isNull(schema.passwordResetTokens.usedAt),
          gt(schema.passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .get() ?? null
  );
}

/** Sets a new password with a valid token. Returns false if the token is not valid. */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const row = findValidToken(token);
  if (!row) return false;
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(newPassword);
  const hasCredential = await ctx.internalAdapter.findCredentialAccount(row.userId);
  if (hasCredential) {
    await ctx.internalAdapter.updatePassword(row.userId, hash);
  } else {
    await ctx.internalAdapter.linkAccount({
      userId: row.userId,
      providerId: "credential",
      accountId: row.userId,
      password: hash,
    });
  }
  await ctx.internalAdapter.deleteUserSessions(row.userId);
  db.update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, row.id))
    .run();
  return true;
}
