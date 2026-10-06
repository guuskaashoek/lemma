/**
 * Opens the SQLite database, turns on WAL mode and foreign keys (needed for
 * ON DELETE CASCADE, which SQLite leaves off by default), and applies pending
 * migrations.
 *
 * Kept free of `server-only` so scripts (migrate, make-admin) and tests can
 * use it too.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export function openDatabase(file = process.env.DATABASE_PATH ?? "./data/lemma.db") {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(/*turbopackIgnore: true*/ file)), { recursive: true });
  }
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");

  const db = drizzle(sqlite, { schema });
  // Migrations are idempotent, so running them on every start keeps
  // self-hosting simple: pull, build, start.
  migrate(db, { migrationsFolder: path.join(/*turbopackIgnore: true*/ process.cwd(), "drizzle") });
  return db;
}

export type Db = ReturnType<typeof openDatabase>;
