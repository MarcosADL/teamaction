// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? 'https://teamaction.vercel.app';

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/*'] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
