// app/api/posts/route.ts
export const preferredRegion = 'fra1';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

function toSlug(s: string) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const body = await req.json();

    const title = String(body.title || '').trim();
    if (!title) return NextResponse.json({ ok: false, error: 'Título é obrigatório.' }, { status: 400 });

    const slug        = (body.slug && String(body.slug).trim()) || toSlug(title);
    const excerpt     = body.summary ?? body.excerpt ?? null;
    const content     = body.content ?? null;

    // aceita tanto coverImage/cover_url como image_url
    const image_url   = body.image_url ?? body.coverImage ?? body.cover_url ?? null;
    const video_url   = body.video_url ?? body.videoUrl ?? null;

    const dateStr = String(body.date ?? '').trim();
    const date    = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : null;

    const toArray = (v: any) =>
      Array.isArray(v) ? v :
        String(v ?? '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

    const categories  = toArray(body.categories);
    const tags        = toArray(body.tags);

    const status = (() => {
      const x = String(body.status || '').toLowerCase();
      if (x.startsWith('publi')) return 'published';
      if (x.startsWith('rascun')) return 'draft';
      return x === 'published' || x === 'draft' ? x : 'draft';
    })();

    const sql = `
      insert into public.posts
        (slug, title, excerpt, content, image_url, video_url, date, categories, tags, status)
      values
        ($1,   $2,    $3,     $4,     $5,        $6,        $7,   $8,         $9,   $10)
      on conflict (slug) do update set
        title = excluded.title,
        excerpt = excluded.excerpt,
        content = excluded.content,
        image_url = excluded.image_url,
        video_url = excluded.video_url,
        date = excluded.date,
        categories = excluded.categories,
        tags = excluded.tags,
        status = excluded.status,
        updated_at = now()
      returning id, slug, title
    `;
    const params = [slug, title, excerpt, content, image_url, video_url, date, categories, tags, status];
    const { rows } = await client.query(sql, params);

    return NextResponse.json({ ok: true, post: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Erro' }, { status: 500 });
  } finally {
    client.release();
  }
}
