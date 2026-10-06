/**
 * Better Auth configuration.
 *
 * - E-mail + password only. No e-mail is ever sent: password resets are
 *   handled by an admin who creates a one-time reset link (see
 *   `src/lib/password-reset.ts`).
 * - Passwords are hashed by Better Auth (scrypt).
 * - Built-in rate limiting protects the public `/api/auth/*` endpoints.
 *   Our own server actions add a second limiter (`src/lib/rate-limit.ts`).
 */
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db, schema } from "@/db";
import { PASSWORD_MIN } from "./validation";

/** E-mail addresses (lowercase) that automatically get the admin role. */
const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export const auth = betterAuth({
  appName: "Lemma",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      rateLimit: schema.rateLimit,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    // Stay signed in for 30 days; the expiry slides forward once a day.
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60 * 10, max: 3 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Promote configured e-mail addresses to admin on registration.
        before: async (newUser) => ({
          data: {
            ...newUser,
            role: adminEmails.has(newUser.email.toLowerCase()) ? "admin" : "user",
          },
        }),
      },
    },
  },
  plugins: [
    admin(),
    // Lets server actions set the session cookie. Must be the last plugin.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
