// app/sitemap.ts
import type { MetadataRoute } from "next";
import { pool } from "@/lib/db";
export const revalidate = 60 * 60 * 24;

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/,"") ||
  "https://teamaction.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
  try {
    const { rows } = await pool.query(
      `select slug, greatest(date, now() - interval '30 days') as last
       from posts where status='publicado'`
    );
    for (const r of rows) {
      urls.push({
        url: `${BASE}/blog/${r.slug}`,
        lastModified: r.last as Date,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {}
  return urls;
}
