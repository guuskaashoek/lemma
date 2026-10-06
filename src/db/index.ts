/**
 * Shared SQLite connection, opened lazily on first use.
 *
 * Lazy opening matters for `next build`: the build imports server modules in
 * several worker processes, and none of them should open (or migrate) the
 * database. better-sqlite3 is synchronous and very fast for a single-server
 * app like Lemma.
 */
import "server-only";
import { openDatabase, type Db } from "./open";

const globalForDb = globalThis as unknown as { lemmaDb?: Db };

function instance(): Db {
  // Reuse the connection across hot reloads in development.
  globalForDb.lemmaDb ??= openDatabase();
  return globalForDb.lemmaDb;
}

/** Drizzle database; the real connection is created on first property access. */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = instance();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export * as schema from "./schema";
