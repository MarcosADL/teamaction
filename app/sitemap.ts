// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

// 👉 impede o Next de pré-renderizar isto no build
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function baseUrl() {
  // usa o teu domínio; podes pôr em ENV também
  return process.env.NEXT_PUBLIC_SITE_URL || "https://teamaction-pt.vercel.app";
}

export async function GET() {
  try {
    const posts = await getPosts();
    const base = baseUrl();

    const urls =
      posts
        .map(
          (p) =>
            `<url><loc>${base}/blog/${p.slug}</loc><changefreq>weekly</changefreq></url>`
        )
        .join("") || "";

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      `<url><loc>${base}</loc><changefreq>weekly</changefreq></url>` +
      `${urls}` +
      `</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch {
    // fallback mínimo para não falhar build/runtime
    const base = baseUrl();
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      `<url><loc>${base}</loc></url>` +
      `</urlset>`;
    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
