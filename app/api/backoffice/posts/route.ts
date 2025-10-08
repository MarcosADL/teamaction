// app/api/backoffice/posts/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeStatus(s: any): "published" | "draft" {
  const v = String(s ?? "").toLowerCase().trim();
  if (["publicado", "published", "publish", "public"].includes(v)) return "published";
  if (["rascunho", "draft"].includes(v)) return "draft";
  return "published";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const title = (body?.title ?? "").toString().trim();
    if (!title) {
      return Response.json({ error: "Título é obrigatório." }, { status: 400 });
    }

    const slugRaw = (body?.slug ?? "").toString().trim();
    const slug = slugify(slugRaw || title);
    if (!slug) {
      return Response.json({ error: "Não foi possível gerar o slug." }, { status: 400 });
    }

    const excerpt = (body?.excerpt ?? "") || null;
    const content = (body?.content ?? "") || null;
    const date = (body?.date ?? "") || null;

    const cover =
      (body?.coverImage ?? body?.cover_url ?? body?.cover_image ?? "") || null;
    const video = (body?.videoUrl ?? body?.video_url ?? "") || null;

    const toArr = (v: any) =>
      Array.isArray(v)
        ? v.map((x) => String(x).trim()).filter(Boolean)
        : String(v ?? "")
            .split(/[.,]/)
            .map((x) => x.trim())
            .filter(Boolean);

    const categories = toArr(body?.categories);
    const tags = toArr(body?.tags);
    const status = normalizeStatus(body?.status); // <- enum PT→EN

    // --- SUPABASE REST (HTTPS; evita SSL do 'pg') ---
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!baseUrl || !serviceKey) {
      return Response.json(
        { error: "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const url = `${baseUrl}/rest/v1/posts?on_conflict=slug`;
    const record = {
      slug,
      title,
      excerpt,
      summary: excerpt, // compat
      content,
      date, // YYYY-MM-DD
      cover_image: cover,
      cover_url: cover, // compat
      video_url: video,
      categories,
      tags,
      status, // "published" | "draft"
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        "Accept-Profile": "public",   // força schema leitura
        "Content-Profile": "public",  // força schema escrita
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([record]), // array → upsert e return
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        (Array.isArray(data) ? data?.[0]?.message : data?.message) ||
        (data as any)?.error ||
        `Falhou (${res.status})`;
      return Response.json({ error: msg }, { status: res.status });
    }

    return Response.json({ ok: true, slug }, { status: 201 });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Erro inesperado a criar post." },
      { status: 500 }
    );
  }
}
