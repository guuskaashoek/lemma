# Lemma: one Next.js process with a SQLite database (better-sqlite3).
# Base image pinned by digest (Node 24.22.2, the runtime already live): a moved
# tag cannot change what is built. Bump tag + digest together on a Node release.
FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54 AS build
WORKDIR /app
# Toolchain in case better-sqlite3 has no prebuilt binary for this platform.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY scripts ./scripts
# postinstall copies MathLive's fonts into public/mathlive.
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/data/lemma.db
COPY --from=build --chown=node:node /app /app
# Migrations in /app/drizzle run on startup; mount the database file to keep it across deploys.
RUN mkdir -p /app/data && chown node:node /app/data
# No root inside the container: the bind-mounted SQLite files stay writable for uid 1000.
USER node
EXPOSE 3000
CMD ["npm", "start"]
