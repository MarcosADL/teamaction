// app/api/health/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const ver = await client.query("select version()");
    const t = await client.query("select to_regclass('public.posts') as exists");
    return NextResponse.json({
      ok: true,
      db_version: ver.rows?.[0]?.version ?? null,
      posts_table: !!t.rows?.[0]?.exists,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro" }, { status: 500 });
  } finally {
    try { client?.release(); } catch {}
  }
}
