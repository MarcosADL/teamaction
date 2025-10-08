// app/api/backoffice/posts/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeStatus(s: any): "published" | "draft" {
  const v = String(s ?? "").toLowerCase().trim();
  if (["publicado", "published", "publish", "public"].includes(v)) return "published";
  if (["rascunho", "draft"].includes(v)) return "draft";
  return "published";
}

function reqEnv() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY.");
  return { base, key };
}

/* ----------------------- LISTAR POSTS (GET) ----------------------- */
export async function GET() {
  try {
    const { base, key } = reqEnv();
    const url =
      `${base}/rest/v1/posts?` +
      new URLSearchParams({
        select: "id,slug,title,excerpt,summary,cover_image,cover_url,date,status",
        order: "date.desc",
      }).toString();

    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Accept-Profile": "public",
        "Content-Profile": "public",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data as any)?.message || `Falhou listar (${res.status})`;
      return Response.json({ error: msg }, { status: res.status });
    }

    const rows = (Array.isArray(data) ? data : []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? r.summary ?? null,
      date: r.date,
      coverImage: r.cover_image ?? r.cover_url ?? null,
      status: r.status,
    }));

    return Response.json({ ok: true, items: rows });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Erro a listar posts." }, { status: 500 });
  }
}

/* ----------------------- CRIAR/UPSERT (POST) ---------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const title = (body?.title ?? "").toString().trim();
    if (!title) return Response.json({ error: "Título é obrigatório." }, { status: 400 });

    const slugRaw = (body?.slug ?? "").toString().trim();
    const slug = slugify(slugRaw || title);
    if (!slug) return Response.json({ error: "Não foi possível gerar o slug." }, { status: 400 });

    const excerpt = (body?.excerpt ?? "") || null;
    const content = (body?.content ?? "") || null;
    const date = (body?.date ?? "") || null;
    const cover = (body?.coverImage ?? body?.cover_url ?? body?.cover_image ?? "") || null;
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
    const status = normalizeStatus(body?.status);

    const { base, key } = reqEnv();
    const url = `${base}/rest/v1/posts?on_conflict=slug`;

    const record = {
      slug,
      title,
      excerpt,
      summary: excerpt, // manter compat
      content,
      date,             // YYYY-MM-DD (ou null)
      cover_image: cover,
      cover_url: cover, // manter compat
      video_url: video,
      categories,
      tags,
      status,           // "published" | "draft"
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Accept-Profile": "public",
        "Content-Profile": "public",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([record]),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (Array.isArray(data) ? data?.[0]?.message : (data as any)?.message) ||
        (data as any)?.error ||
        `Falhou (${res.status})`;
      return Response.json({ error: msg }, { status: res.status });
    }

    return Response.json({ ok: true, slug }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Erro inesperado a criar post." }, { status: 500 });
  }
}
