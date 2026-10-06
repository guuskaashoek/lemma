/** Applies all pending migrations to the database in DATABASE_PATH. */
import { openDatabase } from "../src/db/open";

openDatabase();
console.log("Database is up to date.");
