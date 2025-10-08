// app/api/health-rest/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!BASE || !ANON) {
    return NextResponse.json(
      { ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 }
    );
  }

  const url = `${BASE}/rest/v1/posts?select=slug&limit=1`;

  try {
    const r = await fetch(url, {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
      cache: "no-store",
    });
    const txt = await r.text();
    const json = (() => { try { return JSON.parse(txt); } catch { return txt; } })();
    return NextResponse.json({ ok: r.ok, status: r.status, body: json });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "fetch failed" }, { status: 500 });
  }
}
