// lib/posts.ts — versão BD (Supabase/Postgres)
import { pool } from "@/lib/db";

// ----------------- Tipos -----------------
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  date?: string; // YYYY-MM-DD
  categories?: string[];
  tags?: string[];
  coverImage?: string;
  status?: "rascunho" | "publicado";
  author?: string;
  readingMinutes?: number;
  videoUrl?: string;
};

export type PostListItem = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;
  categories?: string[];
  tags?: string[];
  coverImage?: string;
};

export type CountItem = { name: string; count: number };

// ----------------- Utils -----------------
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// aceita apenas imagens / thumbs youtube
function cleanUrl(u?: string): string | undefined {
  const t = (u ?? "").trim();
  if (!t || t === "/" || t.toLowerCase() === "about:blank") return undefined;

  const isRelative = t.startsWith("/");
  const imageExt = /\.(avif|jpe?g|png|webp|gif|svg)$/i;

  if (isRelative) return imageExt.test(t) ? t : undefined;

  try {
    const url = new URL(t);
    const host = url.hostname.toLowerCase();
    if (host === "i.ytimg.com") return t;
    if (imageExt.test(url.pathname)) return t;
    return undefined;
  } catch {
    return undefined;
  }
}

// mapeia linha da BD -> Post (usamos nomes do teu modelo)
function rowToPost(r: any): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    content: r.content ?? "",
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
    status: (r.status as "publicado" | "rascunho") ?? "publicado",
    author: r.author ?? undefined,
    readingMinutes: r.reading_minutes ?? undefined,
    videoUrl: (r.video_url ?? "").trim() || undefined,
  };
}

// ----------------- Leitura -----------------
export async function getAllPosts(): Promise<Post[]> {
  const { rows } = await pool.query(
    `select id, slug, title, excerpt, content, date, categories, tags,
            image_url, video_url, status, author, reading_minutes
     from public.posts
     order by coalesce(date, created_at) desc nulls last, created_at desc`
  );
  return rows.map(rowToPost);
}

export async function getPostById(id: string) {
  const { rows } = await pool.query(
    `select id, slug, title, excerpt, content, date, categories, tags,
            image_url, video_url, status, author, reading_minutes
     from public.posts
     where id = $1
     limit 1`,
    [id]
  );
  return rows[0] ? rowToPost(rows[0]) : undefined;
}

export async function getPosts(): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt, date, categories, tags, image_url
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
     order by coalesce(date, created_at) desc nulls last, created_at desc`
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
  }));
}

export async function searchPosts(q: string): Promise<PostListItem[]> {
  const s = `%${q}%`;
  const { rows } = await pool.query(
    `select slug, title, excerpt, date, categories, tags, image_url
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
       and (
         title ilike $1
         or excerpt ilike $1
         or array_to_string(tags, ',') ilike $1
         or array_to_string(categories, ',') ilike $1
       )
     order by coalesce(date, created_at) desc nulls last, created_at desc`,
    [s]
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const { rows } = await pool.query(
    `select id, slug, title, excerpt, content, date, categories, tags,
            image_url, video_url, status, author, reading_minutes
     from public.posts
     where slug = $1
       and coalesce(status,'publicado') = 'publicado'
     limit 1`,
    [slug]
  );
  return rows[0] ? rowToPost(rows[0]) : undefined;
}

export async function getLatestPosts(n: number): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt, date, categories, tags, image_url
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
     order by coalesce(date, created_at) desc nulls last, created_at desc
     limit $1`,
    [n]
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
  }));
}

export async function getCategoriesWithCounts(): Promise<CountItem[]> {
  const { rows } = await pool.query(
    `select lower(trim(unnest(categories))) as name, count(*)::int as count
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
     group by 1
     order by 2 desc, 1 asc`
  );
  return rows;
}

export async function getPostsByCategory(category: string): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt, date, categories, tags, image_url
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
       and exists (
         select 1 from unnest(categories) c where lower(c) = lower($1)
       )
     order by coalesce(date, created_at) desc nulls last, created_at desc`,
    [category]
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
  }));
}

export async function getTagsWithCounts(): Promise<CountItem[]> {
  const { rows } = await pool.query(
    `select lower(trim(unnest(tags))) as name, count(*)::int as count
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
     group by 1
     order by 2 desc, 1 asc`
  );
  return rows;
}

export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt, date, categories, tags, image_url
     from public.posts
     where coalesce(status,'publicado') = 'publicado'
       and exists (
         select 1 from unnest(tags) t where lower(t) = lower($1)
       )
     order by coalesce(date, created_at) desc nulls last, created_at desc`,
    [tag]
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    date: r.date ? String(r.date) : undefined,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
    coverImage: cleanUrl(r.image_url ?? undefined),
  }));
}

// -------------- CRUD (Backoffice) --------------
export async function createPost(input: Omit<Post, "id" | "slug"> & { slug?: string }) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);

  // slug único
  const ex = await pool.query(`select 1 from public.posts where slug = $1 limit 1`, [slug]);
  if (ex.rowCount) throw new Error("Slug já existe");

  const params = [
    slug,
    input.title,
    input.excerpt ?? null,
    input.content ?? "",
    input.date ?? null,
    cleanUrl(input.coverImage) ?? null,
    input.videoUrl ?? null,
    (input.categories ?? []) as any,
    (input.tags ?? []) as any,
    (input.status ?? "publicado"),
    input.author ?? null,
    input.readingMinutes ?? null,
  ];

  const { rows } = await pool.query(
    `insert into public.posts
      (slug, title, excerpt, content, date, image_url, video_url,
       categories, tags, status, author, reading_minutes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     returning id, slug, title, excerpt, content, date, categories, tags,
               image_url, video_url, status, author, reading_minutes`,
    params
  );
  return rowToPost(rows[0]);
}

export async function updatePost(id: string, patch: Partial<Post>) {
  // se vier slug novo, validar unicidade
  if (typeof patch.slug === "string" && patch.slug.trim()) {
    const nextSlug = slugify(patch.slug);
    const ex = await pool.query(
      `select 1 from public.posts where slug = $1 and id <> $2 limit 1`,
      [nextSlug, id]
    );
    if (ex.rowCount) throw new Error("Slug já existe");
  }

  // construir SET dinâmico
  const set: string[] = [];
  const vals: any[] = [];
  const push = (sql: string, v: any) => {
    vals.push(v);
    set.push(`${sql} = $${vals.length}`);
  };

  if (patch.title !== undefined) push("title", patch.title);
  if (patch.excerpt !== undefined) push("excerpt", patch.excerpt);
  if (patch.content !== undefined) push("content", patch.content);
  if (patch.date !== undefined) push("date", patch.date || null);
  if (patch.coverImage !== undefined) push("image_url", cleanUrl(patch.coverImage) ?? null);
  if (patch.videoUrl !== undefined) push("video_url", patch.videoUrl || null);
  if (patch.categories !== undefined) push("categories", patch.categories ?? []);
  if (patch.tags !== undefined) push("tags", patch.tags ?? []);
  if (patch.status !== undefined) push("status", patch.status);
  if (patch.author !== undefined) push("author", patch.author || null);
  if (patch.readingMinutes !== undefined) push("reading_minutes", patch.readingMinutes ?? null);
  if (patch.slug !== undefined) push("slug", slugify(patch.slug!));

  if (!set.length) {
    const { rows } = await pool.query(
      `select id, slug, title, excerpt, content, date, categories, tags,
              image_url, video_url, status, author, reading_minutes
       from public.posts where id = $1`,
      [id]
    );
    if (!rows[0]) throw new Error("Post não encontrado");
    return rowToPost(rows[0]);
  }

  vals.push(id);
  const { rows } = await pool.query(
    `update public.posts
       set ${set.join(", ")}, updated_at = now()
     where id = $${vals.length}
     returning id, slug, title, excerpt, content, date, categories, tags,
               image_url, video_url, status, author, reading_minutes`,
    vals
  );
  if (!rows[0]) throw new Error("Post não encontrado");
  return rowToPost(rows[0]);
}

export async function deletePost(id: string) {
  await pool.query(`delete from public.posts where id = $1`, [id]);
  return { ok: true };
}

// -------------- Alias compatibilidade --------------
export async function addPost(
  input: Omit<Post, "id" | "slug"> & { slug?: string }
) {
  return createPost(input);
}
