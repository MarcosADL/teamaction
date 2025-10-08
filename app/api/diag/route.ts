// app/api/diag/route.ts
// Diagnóstico de REST Supabase em produção (sem 'pg')
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!base || !anon) {
    return Response.json(
      {
        ok: false,
        reason: "Faltam envs",
        has_BASE: !!base,
        has_ANON: !!anon,
      },
      { status: 500 }
    );
  }

  try {
    const url = `${base}/rest/v1/posts?select=slug&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
      cache: "no-store",
    });

    const text = await res.text();
    return Response.json(
      { ok: res.ok, status: res.status, body: text.slice(0, 4000) },
      { status: res.ok ? 200 : 500 }
    );
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
