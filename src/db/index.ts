import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() { const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is not configured"); if (!database) { const client = postgres(connectionString, { prepare:false, max:5 }); database = drizzle(client, { schema }); } return database; }
