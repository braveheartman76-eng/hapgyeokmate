import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for the Vercel build");

const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  await sql`CREATE TABLE IF NOT EXISTS app_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;
  const directory = path.join(process.cwd(), "drizzle");
  const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of files) {
    const [existing] = await sql`SELECT name FROM app_migrations WHERE name = ${name}`;
    if (existing) continue;
    const migration = await readFile(path.join(directory, name), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(migration);
      await tx`INSERT INTO app_migrations (name) VALUES (${name})`;
    });
    console.log(`Applied migration: ${name}`);
  }
} finally {
  await sql.end();
}
