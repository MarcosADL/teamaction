// data/posts.ts
// 🔁 Leitura via Supabase REST (HTTPS) — evita SSL do 'pg' em render
// ⚠️ Requer NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY definidos

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

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper para chamadas REST ao Supabase
async function rest<T>(
  path: string,
  searchParams: Record<string, string | number | boolean>
): Promise<T> {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) usp.set(k, String(v));
  const url = `${BASE}/rest/v1/${path}?${usp.toString()}`;

  const res = await fetch(url, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      "Accept-Profile": "public",
      "Content-Profile": "public",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`REST ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as T;
}

// Normalização de linhas → tipos
function toListItem(r: any): PostListItem {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? r.summary ?? null,
    date: r.date,
    coverImage: r.cover_image ?? r.cover_url ?? null,
  };
}

function toPost(r: any): Post {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? r.summary ?? null,
    content: r.content ?? null,
    date: r.date,
    coverImage: r.cover_image ?? r.cover_url ?? null,
    videoUrl: r.video_url ?? null,
    categories: (r.categories ?? []) as string[],
    tags: (r.tags ?? []) as string[],
  };
}

// Lista todos os posts publicados (aceita 'published' e legado 'publicado')
export async function getPosts(): Promise<PostListItem[]> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    cover_image: string | null;
    cover_url: string | null;
    date: string; // YYYY-MM-DD
  };

  const rows = await rest<Row[]>("posts", {
    select: "slug,title,excerpt,summary,cover_image,cover_url,date",
    // OR para aceitar enum novo e valor antigo
    or: "(status.eq.published,status.eq.publicado)",
    order: "date.desc",
  });

  return rows.map(toListItem);
}

// Um post por slug (sem filtrar por status para poderes ver rascunhos no BO)
export async function getPost(slug: string): Promise<Post | null> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    content: string | null;
    cover_image: string | null;
    cover_url: string | null;
    video_url: string | null;
    date: string;
    categories: string[] | null;
    tags: string[] | null;
  };

  const rows = await rest<Row[]>("posts", {
    select:
      "slug,title,excerpt,summary,content,cover_image,cover_url,video_url,date,categories,tags",
    slug: `eq.${slug}`,
    limit: 1,
  });

  const r = rows[0];
  return r ? toPost(r) : null;
}

// Últimos N posts publicados
export async function getLatestPosts(limit = 5): Promise<PostListItem[]> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    cover_image: string | null;
    cover_url: string | null;
    date: string;
  };

  const rows = await rest<Row[]>("posts", {
    select: "slug,title,excerpt,summary,cover_image,cover_url,date",
    or: "(status.eq.published,status.eq.publicado)",
    order: "date.desc",
    limit,
  });

  return rows.map(toListItem);
}

// Procurar por texto (título/excerpt/content)
export async function searchPosts(q: string): Promise<PostListItem[]> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    cover_image: string | null;
    cover_url: string | null;
    date: string;
  };

  // ilike para title/excerpt/content
  const rows = await rest<Row[]>("posts", {
    select: "slug,title,excerpt,summary,cover_image,cover_url,date",
    or: "(status.eq.published,status.eq.publicado)",
    // or composto para pesquisa
    or2: `(title.ilike.*${q}*,excerpt.ilike.*${q}*,content.ilike.*${q}*)`,
    order: "date.desc",
  } as any);

  return rows.map(toListItem);
}

// Posts por categoria (arrays → operador cs contém)
export async function getPostsByCategory(cat: string): Promise<PostListItem[]> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    cover_image: string | null;
    cover_url: string | null;
    date: string;
  };

  const rows = await rest<Row[]>("posts", {
    select: "slug,title,excerpt,summary,cover_image,cover_url,date",
    or: "(status.eq.published,status.eq.publicado)",
    "categories": `cs.{${cat}}`,
    order: "date.desc",
  });

  return rows.map(toListItem);
}

// Posts por tag (arrays → operador cs contém)
export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  type Row = {
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    cover_image: string | null;
    cover_url: string | null;
    date: string;
  };

  const rows = await rest<Row[]>("posts", {
    select: "slug,title,excerpt,summary,cover_image,cover_url,date",
    or: "(status.eq.published,status.eq.publicado)",
    "tags": `cs.{${tag}}`,
    order: "date.desc",
  });

  return rows.map(toListItem);
}

// Contagem de categorias (agrega em JS para evitar RPC/SQL extra)
export async function getCategoriesWithCounts(): Promise<
  { name: string; count: number }[]
> {
  type Row = { categories: string[] | null };

  const rows = await rest<Row[]>("posts", {
    select: "categories",
    or: "(status.eq.published,status.eq.publicado)",
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    for (const c of r.categories ?? []) {
      map.set(c, (map.get(c) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Contagem de tags (agrega em JS)
export async function getTagsWithCounts(): Promise<
  { name: string; count: number }[]
> {
  type Row = { tags: string[] | null };

  const rows = await rest<Row[]>("posts", {
    select: "tags",
    or: "(status.eq.published,status.eq.publicado)",
  });

  const map = new Map<string, number>();
  for (const r of rows) {
    for (const t of r.tags ?? []) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
