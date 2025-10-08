// lib/db.ts
import { Pool } from "pg";
const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
const conn = process.env.DATABASE_URL?.trim() || process.env.SUPABASE_DB_URL?.trim() || "";
if (!conn) console.warn("⚠️ DB URL não definida (DATABASE_URL ou SUPABASE_DB_URL).");

export const pool = new Pool({
  connectionString: conn || undefined,
  ...(isProd ? { ssl: { require: true, rejectUnauthorized: false } }
            : (conn.includes("sslmode") ? {} : { ssl: false as any })),
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});
