// lib/db.ts
import { Pool } from "pg";

const conn = process.env.SUPABASE_DB_URL;
if (!conn) console.warn("[DB] SUPABASE_DB_URL não definida");

export const pool = new Pool({
  connectionString: conn,             // inclui ?sslmode=require
  ssl: { rejectUnauthorized: false }, // evita self-signed
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 5,
});
