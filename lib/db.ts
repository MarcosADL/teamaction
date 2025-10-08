// lib/db.ts
import { Pool } from "pg";

const conn = process.env.SUPABASE_DB_URL;
if (!conn) {
  console.warn("[DB] SUPABASE_DB_URL não definida");
}

// Named export ➜ compatível com `import { pool } from "@/lib/db"`
export const pool = new Pool({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  max: 5,
});
