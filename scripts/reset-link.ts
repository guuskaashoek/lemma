/**
 * Creates a password-reset link from the command line (for when the only
 * admin forgot their own password).
 *   npm run reset-link -- you@example.com
 */
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { openDatabase } from "../src/db/open";
import { passwordResetTokens, user } from "../src/db/schema";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run reset-link -- <email>");
  process.exit(1);
}
const db = openDatabase();
const u = db.select().from(user).where(eq(user.email, email)).get();
if (!u) {
  console.error(`No user with e-mail ${email}.`);
  process.exit(1);
}
// Same format as src/lib/password-reset.ts: only the hash is stored.
const token = crypto.randomBytes(32).toString("base64url");
db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, u.id)).run();
db.insert(passwordResetTokens)
  .values({
    id: crypto.randomUUID(),
    userId: u.id,
    tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  .run();
const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
console.log(`Reset link (valid 24 hours, works once):\n${base}/reset/${token}`);
