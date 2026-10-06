import type { NextConfig } from "next";

/**
 * Lemma is a per-user, self-hosted app: almost every page depends on the
 * signed-in user. We therefore use the classic dynamic rendering model and do
 * not enable Cache Components / partial prefetching.
 */
const nextConfig: NextConfig = {
  // better-sqlite3 is a native module and must not be bundled.
  serverExternalPackages: ["better-sqlite3"],
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
