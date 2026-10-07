# Lemma: one Next.js process with a SQLite database (better-sqlite3).
FROM node:24-bookworm-slim AS build
WORKDIR /app
# Toolchain in case better-sqlite3 has no prebuilt binary for this platform.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY scripts ./scripts
# postinstall copies MathLive's fonts into public/mathlive.
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/data/lemma.db
COPY --from=build /app /app
# Migrations in /app/drizzle run on startup; mount the database file to keep it across deploys.
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["npm", "start"]
