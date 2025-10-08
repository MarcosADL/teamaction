// app/api/posts/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const preferredRegion = "fra1";

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type RouteParams = { params: { id: string } };

function normStatus(input: unknown): "published" | "draft" {
  const v = String(input ?? "").toLowerCase();
  if (v.startsWith("publi")) return "published";
  if (v.startsWith("rascun")) return "draft";
  return v === "published" || v === "draft" ? (v as any) : "draft";
}

export async function DELETE(_: Request, { params }: RouteParams) {
  let client;
  try {
    const { id } = params;
    client = await pool.connect();
    const { rows } = await client.query(
      "DELETE FROM public.posts WHERE id = $1 RETURNING id",
      [id]
    );
    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 });
  } finally {
    try { client?.release(); } catch {}
  }
}

// PATCH opcional: atualiza campos soltos
export async function PATCH(req: Request, { params }: RouteParams) {
  let client;
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({} as any));

    const set: string[] = [];
    const values: any[] = [];
    let i = 1;

    const assign = (col: string, val: any) => {
      set.push(`${col} = $${i++}`);
      values.push(val);
    };

    if ("slug" in body) assign("slug", String(body.slug || "").trim());
    if ("title" in body) assign("title", String(body.title || "").trim());
    if ("excerpt" in body) assign("excerpt", body.excerpt ?? null);
    if ("content" in body) assign("content", body.content ?? null);
    if ("image_url" in body || "coverImage" in body || "cover_url" in body) {
      assign("image_url", body.image_url ?? body.coverImage ?? body.cover_url ?? null);
    }
    if ("video_url" in body || "videoUrl" in body) {
      assign("video_url", body.video_url ?? body.videoUrl ?? null);
    }
    if ("date" in body) {
      const d = String(body.date ?? "").trim();
      assign("date", /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);
    }
    if ("categories" in body) assign("categories", Array.isArray(body.categories) ? body.categories : null);
    if ("tags" in body) assign("tags", Array.isArray(body.tags) ? body.tags : null);
    if ("status" in body) assign("status", normStatus(body.status));

    if (!set.length) {
      return NextResponse.json({ ok: false, error: "Nada para atualizar." }, { status: 400 });
    }

    // updated_at
    set.push("updated_at = now()");

    values.push(id);
    const sql = `
      UPDATE public.posts
      SET ${set.join(", ")}
      WHERE id = $${i}
      RETURNING id, slug, title, excerpt, content, date, categories, tags, status, image_url, video_url
    `;

    client = await pool.connect();
    const { rows } = await client.query(sql, values);
    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: "Não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, post: rows[0] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 });
  } finally {
    try { client?.release(); } catch {}
  }
}
