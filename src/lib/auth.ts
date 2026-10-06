/**
 * Better Auth configuration.
 *
 * - E-mail + password only. No e-mail is ever sent: password resets are
 *   handled by an admin who creates a one-time reset link (see
 *   `src/lib/password-reset.ts`).
 * - Passwords are hashed by Better Auth (scrypt).
 * - Built-in rate limiting protects the public `/api/auth/*` endpoints.
 * - Nobody becomes admin by registering: e-mail addresses are not verified,
 *   so admin rights are only granted from the server (`npm run make-admin`).
 *   Our own server actions add a second limiter (`src/lib/rate-limit.ts`).
 */
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db, schema } from "@/db";
import { PASSWORD_MIN } from "./validation";

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
  plugins: [
    admin(),
    // Lets server actions set the session cookie. Must be the last plugin.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
