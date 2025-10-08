// app/api/backoffice/posts/route.ts
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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

    const cover = (body?.coverImage ?? body?.cover_url ?? body?.cover_image ?? "") || null;
    const video = (body?.videoUrl ?? body?.video_url ?? "") || null;

    // Aceita arrays ou string (ex.: "treino,4x4")
    const toArr = (v: any) =>
      Array.isArray(v)
        ? v.map((x) => String(x).trim()).filter(Boolean)
        : String(v ?? "")
            .split(/[.,]/)
            .map((x) => x.trim())
            .filter(Boolean);

    const categories = toArr(body?.categories);
    const tags = toArr(body?.tags);

    const status = (body?.status ?? "publicado").toString();

    await pool.query(
      `insert into posts
       (slug, title, excerpt, summary, content, date,
        cover_image, cover_url,
        video_url, categories, tags, status)
       values ($1,$2,$3,$3,$4, coalesce($5::date, now()),
               $6, $6,
               $7, $8::text[], $9::text[], $10)
       on conflict (slug) do update set
         title=excluded.title,
         excerpt=excluded.excerpt,
         summary=excluded.summary,
         content=excluded.content,
         date=excluded.date,
         cover_image=excluded.cover_image,
         cover_url=excluded.cover_url,
         video_url=excluded.video_url,
         categories=excluded.categories,
         tags=excluded.tags,
         status=excluded.status`,
      [slug, title, excerpt, content, date, cover, video, categories, tags, status]
    );

    return Response.json({ ok: true, slug }, { status: 201 });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Erro inesperado a criar post." },
      { status: 500 }
    );
  }
}
