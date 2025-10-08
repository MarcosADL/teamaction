// data/posts.ts
// Helpers de Blog com carregamento dinâmico do JSON (robusto em produção).

export type PostStatus = "rascunho" | "publicado";
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string; // ISO
  categories: string[];
  tags: string[];
  coverImage?: string;
  status: PostStatus;
  videoUrl?: string;
};

export type PostListItem = Pick<
  Post,
  "slug" | "title" | "excerpt" | "date" | "coverImage" | "tags" | "categories"
>;

async function loadAll(): Promise<Post[]> {
  try {
    // Import dinâmico evita crash na avaliação do módulo em prod
    const mod: any = await import("./posts.db.json");
    const arr: any[] = Array.isArray(mod?.default) ? mod.default : [];

    return arr
      .filter(Boolean)
      .map((p) => ({
        ...p,
        status: (p?.status === "publicado" ? "publicado" : "rascunho") as PostStatus,
        tags: Array.isArray(p?.tags) ? p.tags : [],
        categories: Array.isArray(p?.categories) ? p.categories : [],
        title: String(p?.title ?? ""),
        slug: String(p?.slug ?? ""),
        excerpt: String(p?.excerpt ?? ""),
        content: String(p?.content ?? ""),
        date: String(p?.date ?? ""),
        coverImage: p?.coverImage ? String(p.coverImage) : undefined,
        videoUrl: p?.videoUrl ? String(p.videoUrl) : undefined,
      }))
      .filter((p) => p.slug && p.title);
  } catch {
    // Falha ao ler/importar JSON → sem posts
    return [];
  }
}

function onlyPublic(a: Post[]) {
  return a.filter((p) => p.status === "publicado");
}

function sortByDateDesc(a: Post[]) {
  return [...a].sort((x, y) => (y.date || "").localeCompare(x.date || ""));
}

function toListItem(p: Post): PostListItem {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    coverImage: p.coverImage,
    tags: p.tags || [],
    categories: p.categories || [],
  };
}

export async function getPosts(): Promise<PostListItem[]> {
  const ALL = onlyPublic(await loadAll());
  return sortByDateDesc(ALL).map(toListItem);
}

export async function searchPosts(q: string): Promise<PostListItem[]> {
  const term = q.trim().toLowerCase();
  const ALL = onlyPublic(await loadAll());
  if (!term) return sortByDateDesc(ALL).map(toListItem);

  return sortByDateDesc(ALL)
    .filter((p) =>
      [p.title, p.excerpt, p.content, ...(p.tags || []), ...(p.categories || [])]
        .join(" ")
        .toLowerCase()
        .includes(term),
    )
    .map(toListItem);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const ALL = onlyPublic(await loadAll());
  const p = ALL.find((x) => x.slug === slug) || null;
  return p ?? null;
}

export type TagCount = { tag: string; count: number };
export type CategoryCount = { category: string; count: number };

export async function getTagsWithCounts(): Promise<TagCount[]> {
  const ALL = onlyPublic(await loadAll());
  const map = new Map<string, number>();
  for (const p of ALL) for (const t of p.tags || []) map.set(t, (map.get(t) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getCategoriesWithCounts(): Promise<CategoryCount[]> {
  const ALL = onlyPublic(await loadAll());
  const map = new Map<string, number>();
  for (const p of ALL) for (const c of p.categories || []) map.set(c, (map.get(c) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const t = tag.trim().toLowerCase();
  const ALL = onlyPublic(await loadAll());
  return sortByDateDesc(ALL)
    .filter((p) => (p.tags || []).some((x) => x.toLowerCase() === t))
    .map(toListItem);
}

export async function getPostsByCategory(category: string): Promise<PostListItem[]> {
  const c = category.trim().toLowerCase();
  const ALL = onlyPublic(await loadAll());
  return sortByDateDesc(ALL)
    .filter((p) => (p.categories || []).some((x) => x.toLowerCase() === c))
    .map(toListItem);
}
