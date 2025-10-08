// app/sitemap.ts
import type { MetadataRoute } from "next";

export const revalidate = 60 * 60 * 24; // 1x/dia

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://teamaction.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/categoria`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Opcional: acrescentar posts do blog.
  // Evita falhar o build caso a origem dependa de DB/rede.
  try {
    const { getPosts } = await import("@/data/posts");
    const posts = await getPosts();
    for (const p of posts) {
      urls.push({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.date ? new Date(p.date) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // silencioso para não partir o build (ex.: ligações a DB em build)
  }

  return urls;
}
