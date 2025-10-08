// data/posts.ts
import { pool } from "@/lib/db";

export type PostListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  date: string; // YYYY-MM-DD
  coverImage?: string | null;
};

export type Post = PostListItem & {
  content: string | null;
  videoUrl: string | null;
  categories: string[];
  tags: string[];
};

function toListItem(r: any): PostListItem {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    date: r.date,
    coverImage: r.cover_image ?? null, // vem do alias nas queries
  };
}

function toPost(r: any): Post {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    date: r.date,
    coverImage: r.cover_image ?? null, // vem do alias nas queries
    videoUrl: r.video_url ?? null,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
  };
}

// Lista todos os posts publicados
export async function getPosts(): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt,
            coalesce(cover_image, cover_url) as cover_image,
            to_char(date,'YYYY-MM-DD') as date
     from posts
     where status = 'publicado'
     order by date desc`
  );
  return rows.map(toListItem);
}

// Um post por slug
export async function getPost(slug: string): Promise<Post | null> {
  const { rows } = await pool.query(
    `select slug, title, excerpt, content,
            coalesce(cover_image, cover_url) as cover_image,
            video_url,
            to_char(date,'YYYY-MM-DD') as date, categories, tags
     from posts
     where slug = $1 and status in ('publicado','rascunho')
     limit 1`,
    [slug]
  );
  return rows[0] ? toPost(rows[0]) : null;
}

// Últimos N posts
export async function getLatestPosts(limit = 5): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt,
            coalesce(cover_image, cover_url) as cover_image,
            to_char(date,'YYYY-MM-DD') as date
     from posts
     where status = 'publicado'
     order by date desc
     limit $1`,
    [limit]
  );
  return rows.map(toListItem);
}

// Procurar por texto (título/excerpt/conteúdo)
export async function searchPosts(q: string): Promise<PostListItem[]> {
  const term = `%${q}%`;
  const { rows } = await pool.query(
    `select slug, title, excerpt,
            coalesce(cover_image, cover_url) as cover_image,
            to_char(date,'YYYY-MM-DD') as date
     from posts
     where status = 'publicado'
       and (title ilike $1 or excerpt ilike $1 or content ilike $1)
     order by date desc`,
    [term]
  );
  return rows.map(toListItem);
}

// Posts por categoria
export async function getPostsByCategory(cat: string): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt,
            coalesce(cover_image, cover_url) as cover_image,
            to_char(date,'YYYY-MM-DD') as date
     from posts
     where status = 'publicado'
       and $1 = any(categories)
     order by date desc`,
    [cat]
  );
  return rows.map(toListItem);
}

// Posts por tag
export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const { rows } = await pool.query(
    `select slug, title, excerpt,
            coalesce(cover_image, cover_url) as cover_image,
            to_char(date,'YYYY-MM-DD') as date
     from posts
     where status = 'publicado'
       and $1 = any(tags)
     order by date desc`,
    [tag]
  );
  return rows.map(toListItem);
}

// Contagem de categorias
export async function getCategoriesWithCounts(): Promise<
  { name: string; count: number }[]
> {
  const { rows } = await pool.query(
    `select unnest(categories) as name, count(*)::int as count
     from posts
     where status = 'publicado' and categories is not null
     group by name
     order by count desc, name asc`
  );
  return rows;
}

// Contagem de tags
export async function getTagsWithCounts(): Promise<
  { name: string; count: number }[]
> {
  const { rows } = await pool.query(
    `select unnest(tags) as name, count(*)::int as count
     from posts
     where status = 'publicado' and tags is not null
     group by name
     order by count desc, name asc`
  );
  return rows;
}
