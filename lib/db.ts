// lib/db.ts
import { Pool } from "pg";

const conn = process.env.SUPABASE_DB_URL;
if (!conn) console.warn("[DB] ⚠️ SUPABASE_DB_URL não definida");

export const pool = new Pool({
  connectionString: conn,
  ssl: conn?.includes("sslmode") ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 15000,
  max: 10,
});
