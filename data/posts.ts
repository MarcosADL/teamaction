// data/posts.ts
// Lê os posts de um JSON estático e expõe helpers seguros para produção.

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

export type PostListItem = Pick<Post, "slug"|"title"|"excerpt"|"date"|"coverImage"|"tags"|"categories">;

// Import JSON estático (funciona bem no Vercel / RSC)
import postsJson from "./posts.db.json" assert { type: "json" };

const ALL: Post[] = (postsJson as any as Post[])
  .filter(Boolean)
  .map((p) => ({
    ...p,
    status: (p.status === "publicado" ? "publicado" : "rascunho") as PostStatus,
  }));

function onlyPublic(a: Post[]) {
  return a.filter((p) => p.status === "publicado");
}

function sortByDateDesc(a: Post[]) {
  return [...a].sort((x, y) => (y.date || "").localeCompare(x.date || ""));
}

export async function getPosts(): Promise<PostListItem[]> {
  return sortByDateDesc(onlyPublic(ALL)).map(toListItem);
}

export async function searchPosts(q: string): Promise<PostListItem[]> {
  const term = q.trim().toLowerCase();
  if (!term) return getPosts();
  return sortByDateDesc(onlyPublic(ALL))
    .filter((p) =>
      [p.title, p.excerpt, p.content, ...(p.tags||[]), ...(p.categories||[])]
        .join(" ")
        .toLowerCase()
        .includes(term)
    )
    .map(toListItem);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const p = ALL.find((x) => x.slug === slug) || null;
  return p && p.status === "publicado" ? p : null;
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
