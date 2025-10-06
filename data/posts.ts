export type PostListItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover?: string;
  tags: string[];
  category?: string;
};

export type PostFull = PostListItem & { content: string };
export type CountItem = { name: string; count: number };

const POSTS: PostFull[] = [
  {
    slug: "bem-vindo-ao-blog-teamaction",
    title: "Bem-vindo ao Blog TeamAction",
    excerpt: "Arranque do nosso blog com tática, treino e gestão.",
    date: "2025-09-01",
    cover: "/images/blog/welcome.jpg",
    tags: ["apresentação", "equipa"],
    category: "Notícias",
    content: `# Olá

Este é o primeiro post.

- Listas
- Tabelas
- Links
`
  }
];

export async function getPosts(): Promise<PostListItem[]> {
  return POSTS.map(({ content, ...rest }) => rest).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  const p = POSTS.find((x) => x.slug === slug);
  return p ?? null;
}

export async function searchPosts(q: string): Promise<PostListItem[]> {
  const s = q.toLowerCase();
  return POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(s) ||
      p.excerpt.toLowerCase().includes(s) ||
      p.tags.some((t) => t.toLowerCase().includes(s))
  ).map(({ content, ...rest }) => rest);
}

export async function getCategoriesWithCounts(): Promise<CountItem[]> {
  const map = new Map<string, number>();
  POSTS.forEach((p) => {
    if (!p.category) return;
    map.set(p.category, (map.get(p.category) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTagsWithCounts(): Promise<CountItem[]> {
  const map = new Map<string, number>();
  POSTS.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getLatestPosts(limit = 5): Promise<PostListItem[]> {
  const list = await getPosts();
  return list.slice(0, limit);
}

export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const s = tag.toLowerCase();
  return POSTS.filter((p) => p.tags.some((t) => t.toLowerCase() === s)).map(({ content, ...rest }) => rest);
}

export async function getPostsByCategory(category?: string): Promise<PostListItem[]> {
  const s = (category ?? "").toLowerCase().trim();
  if (!s) return [];
  return POSTS
    .filter((p) => ((p.category ?? "").toLowerCase().trim() === s))
    .map(({ content, ...rest }) => rest);
}