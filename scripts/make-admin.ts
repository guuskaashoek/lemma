/**
 * Gives an existing user the admin role.
 *   npm run make-admin -- you@example.com
 */
import { eq } from "drizzle-orm";
import { openDatabase } from "../src/db/open";
import { user } from "../src/db/schema";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}
const db = openDatabase();
const result = db.update(user).set({ role: "admin" }).where(eq(user.email, email)).run();
console.log(result.changes ? `${email} is now an admin.` : `No user with e-mail ${email}.`);
