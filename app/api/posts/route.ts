// app/api/posts/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const preferredRegion = "fra1";

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// -------- helpers --------
function toSlug(s: string) {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function normStatus(input: unknown): "published" | "draft" {
  const v = String(input ?? "").toLowerCase();
  if (v.startsWith("publi")) return "published";
  if (v.startsWith("rascun")) return "draft";
  return v === "published" || v === "draft" ? (v as any) : "draft";
}

// ===================== GET =====================
// /api/posts?q=&page=&pageSize=&status=published|draft|all
export async function GET(req: Request) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
    const pageSize = Math.min(1000, Math.max(1, Number(searchParams.get("pageSize") || "50") || 50));
    const statusParam = (searchParams.get("status") || "all").toLowerCase();

    const filters: string[] = [];
    const params: any[] = [];
    let pi = 1;

    // status
    if (statusParam === "published" || statusParam === "publicado") {
      filters.push(`status = 'published'`);
    } else if (statusParam === "draft" || statusParam === "rascunho") {
      filters.push(`status = 'draft'`);
    } // "all" → sem filtro

    // pesquisa
    if (q) {
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
      const t1 = `title ILIKE $${pi++}`;
      const t2 = `excerpt ILIKE $${pi++}`;
      const t3 = `content ILIKE $${pi++}`;
      const t4 = `EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${pi++})`;
      const t5 = `EXISTS (SELECT 1 FROM unnest(categories) c WHERE c ILIKE $${pi++})`;
      filters.push(`(${t1} OR ${t2} OR ${t3} OR ${t4} OR ${t5})`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    client = await pool.connect();

    // total
    const countSql = `SELECT COUNT(*)::int AS n FROM public.posts ${where}`;
    const { rows: countRows } = await client.query(countSql, params);
    const total = countRows[0]?.n ?? 0;

    // items
    const itemsSql = `
      SELECT
        id, slug, title, excerpt, content, date, categories, tags, status,
        image_url, cover_image, video_url,
        COALESCE(date::timestamptz, created_at) AS ord
      FROM public.posts
      ${where}
      ORDER BY ord DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const itemsParams = [...params, pageSize, (page - 1) * pageSize];
    const { rows } = await client.query(itemsSql, itemsParams);

    return NextResponse.json({ ok: true, total, items: rows }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 });
  } finally {
    try { client?.release(); } catch {}
  }
}

// ===================== POST =====================
// cria/atualiza (upsert por slug)
export async function POST(req: Request) {
  let client;
  try {
    const body = await req.json().catch(() => ({} as any));

    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "Título é obrigatório." }, { status: 400 });
    }

    const slug = (body.slug && String(body.slug).trim()) || toSlug(title);
    const excerpt = body.summary ?? body.excerpt ?? null;
    const content = body.content ?? null;

    const image_url = body.image_url ?? body.coverImage ?? body.cover_url ?? null;
    const video_url = body.video_url ?? body.videoUrl ?? null;

    const dateStr = String(body.date ?? "").trim();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : null;

    const toArray = (v: any) =>
      Array.isArray(v)
        ? v
        : String(v ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const categories = toArray(body.categories);
    const tags = toArray(body.tags);

    const status = normStatus(body.status);

    client = await pool.connect();

    const sql = `
      INSERT INTO public.posts
        (slug, title, excerpt, content, image_url, video_url, date, categories, tags, status)
      VALUES
        ($1,   $2,    $3,     $4,     $5,        $6,        $7,   $8,         $9,   $10)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        video_url = EXCLUDED.video_url,
        date = EXCLUDED.date,
        categories = EXCLUDED.categories,
        tags = EXCLUDED.tags,
        status = EXCLUDED.status,
        updated_at = now()
      RETURNING id, slug, title
    `;
    const params = [slug, title, excerpt, content, image_url, video_url, date, categories, tags, status];
    const { rows } = await client.query(sql, params);

    return NextResponse.json({ ok: true, post: rows[0] }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || e?.code || "Erro";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  } finally {
    try { client?.release(); } catch {}
  }
}
