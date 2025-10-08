export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// app/backoffice/posts/actions.ts
"use server";

import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createPost(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) throw new Error("Título obrigatório");

  const slug = slugify((formData.get("slug") as string) || title) || randomUUID();
  const excerpt = (formData.get("excerpt") as string) || null;
  const content = (formData.get("content") as string) || null;
  const date = (formData.get("date") as string) || null;
  const cover = (formData.get("coverImage") as string) || null;
  const video = (formData.get("videoUrl") as string) || null;
  const categories = ((formData.get("categories") as string) || "")
    .split(".").map(s=>s.trim()).filter(Boolean);
  const tags = ((formData.get("tags") as string) || "")
    .split(".").map(s=>s.trim()).filter(Boolean);
  const status = (formData.get("status") as string) || "publicado";

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
  return { ok: true, slug };
}
