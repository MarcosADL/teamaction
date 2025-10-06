// lib/posts.ts — fonte única de dados (persistência local em JSON)
import fs from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "posts.db.json");

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
  videoUrl?: string; // vídeo opcional (YouTube)
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
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// aceita apenas URLs que parecem ser de imagem (jpg|jpeg|png|webp|gif|svg)
// permite caminhos relativos começados por "/" com essas extensões
// permite também thumbs do YouTube (i.ytimg.com)
function cleanUrl(u?: string): string | undefined {
  const t = (u ?? "").trim();
  if (!t || t === "/" || t.toLowerCase() === "about:blank") return undefined;

  const isRelative = t.startsWith("/");
  const imageExt = /\.(avif|jpe?g|png|webp|gif|svg)$/i;

  if (isRelative) {
    return imageExt.test(t) ? t : undefined;
  }

  try {
    const url = new URL(t);
    const host = url.hostname.toLowerCase();
    if (host === "i.ytimg.com") return t; // thumbs do youtube ok
    if (imageExt.test(url.pathname)) return t; // termina com extensão de imagem
    // qualquer outro host/URL sem extensão de imagem -> rejeita
    return undefined;
  } catch {
    return undefined;
  }
}

async function ensureFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DB_FILE);
  } catch {
    const seed: Post[] = [
      {
        id: "seed-1",
        slug: "bem-vindo-ao-blog-teamaction",
        title: "Bem-vindo ao Blog TeamAction",
        excerpt: "Arranque do nosso blog com tática, treino e gestão.",
        content: "Conteúdo inicial.",
        date: "2025-09-01",
        categories: ["Notícias"],
        tags: ["equipa", "blog"],
        coverImage: "/og/post-og.svg",
        status: "publicado",
      },
    ];
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function readDB(): Promise<Post[]> {
  noStore(); // evitar cache
  await ensureFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  const arr = JSON.parse(raw) as Post[];
  return Array.isArray(arr) ? arr : [];
}

async function writeDB(items: Post[]) {
  await ensureFile();
  await fs.writeFile(DB_FILE, JSON.stringify(items, null, 2), "utf8");
}

// -------------- API pública --------------
export async function getAllPosts(): Promise<Post[]> {
  return readDB();
}

export async function getPostById(id: string) {
  const all = await getAllPosts();
  return all.find((p) => p.id === id);
}

export async function getPosts(): Promise<PostListItem[]> {
  const db = await readDB();
  return db
    .filter((p) => (p.status ?? "publicado") === "publicado")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      categories: p.categories,
      tags: p.tags,
      coverImage: cleanUrl(p.coverImage),
    }));
}

export async function searchPosts(q: string): Promise<PostListItem[]> {
  const s = q.toLowerCase();
  const list = await getPosts();
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(s) ||
      (p.excerpt?.toLowerCase().includes(s) ?? false) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(s)) ||
      (p.categories ?? []).some((c) => c.toLowerCase().includes(s))
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const db = await readDB();
  const p = db.find(
    (x) => x.slug === slug && (x.status ?? "publicado") === "publicado"
  );
  if (!p) return undefined;
  return {
    ...p,
    coverImage: cleanUrl(p.coverImage),
    videoUrl: (p.videoUrl ?? "").trim() || undefined,
  };
}

export async function getLatestPosts(n: number): Promise<PostListItem[]> {
  const list = await getPosts();
  return list.slice(0, n);
}

export async function getCategoriesWithCounts(): Promise<CountItem[]> {
  const list = await getPosts();
  const map = new Map<string, number>();
  list.forEach((p) =>
    (p.categories ?? []).forEach((c) => map.set(c, (map.get(c) ?? 0) + 1))
  );
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export async function getPostsByCategory(category: string): Promise<PostListItem[]> {
  const list = await getPosts();
  const c = category.toLowerCase();
  return list.filter((p) => (p.categories ?? []).some((x) => x.toLowerCase() === c));
}

export async function getTagsWithCounts(): Promise<CountItem[]> {
  const list = await getPosts();
  const map = new Map<string, number>();
  list.forEach((p) =>
    (p.tags ?? []).forEach((t) => map.set(t, (map.get(t) ?? 0) + 1))
  );
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}

export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  const list = await getPosts();
  const t = tag.toLowerCase();
  return list.filter((p) => (p.tags ?? []).some((x) => x.toLowerCase() === t));
}

// -------------- CRUD (Backoffice) --------------
export async function createPost(input: Omit<Post, "id" | "slug"> & { slug?: string }) {
  const db = await readDB();
  const id = crypto.randomUUID();
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);
  if (db.some((p) => p.slug === slug)) {
    throw new Error("Slug já existe");
  }
  const post: Post = {
    id,
    slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    date: input.date,
    categories: input.categories ?? [],
    tags: input.tags ?? [],
    coverImage: cleanUrl(input.coverImage),
    status: input.status ?? "publicado",
    author: input.author,
    readingMinutes: input.readingMinutes,
    videoUrl: (input.videoUrl ?? "").trim() || undefined,
  };
  db.unshift(post);
  await writeDB(db);
  return post;
}

export async function updatePost(id: string, patch: Partial<Post>) {
  const db = await readDB();
  const idx = db.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Post não encontrado");
  const prev = db[idx];

  let nextSlug = prev.slug;
  if (typeof patch.slug === "string" && patch.slug.trim()) {
    nextSlug = slugify(patch.slug);
    if (db.some((p, i) => i !== idx && p.slug === nextSlug)) {
      throw new Error("Slug já existe");
    }
  }

  const next: Post = {
    ...prev,
    ...patch,
    slug: nextSlug,
    coverImage: patch.hasOwnProperty("coverImage")
      ? cleanUrl(patch.coverImage)
      : prev.coverImage,
    videoUrl: patch.hasOwnProperty("videoUrl")
      ? ((patch.videoUrl ?? "").trim() || undefined)
      : prev.videoUrl,
  };
  db[idx] = next;
  await writeDB(db);
  return next;
}

export async function deletePost(id: string) {
  const db = await readDB();
  const next = db.filter((p) => p.id !== id);
  await writeDB(next);
  return { ok: true };
}

// -------------- Aliases de compatibilidade --------------
export async function addPost(
  input: Omit<Post, "id" | "slug"> & { slug?: string }
) {
  return createPost(input);
}
