import type { NextConfig } from "next";

/**
 * Lemma is a per-user, self-hosted app: almost every page depends on the
 * signed-in user. We therefore use the classic dynamic rendering model and do
 * not enable Cache Components / partial prefetching.
 */
const nextConfig: NextConfig = {
  // better-sqlite3 is a native module and must not be bundled.
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Base CSP without script-src (Next inlines scripts without a nonce):
          // no framing, no <base> hijack, no plugins, and forms only post to
          // Lemma itself (every form is a same-origin server action).
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
  turbopack: {
    // Keep Turbopack scoped to this project, even if a parent folder has a lockfile.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
