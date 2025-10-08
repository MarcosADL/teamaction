// lib/posts.ts
// Helpers unificados: Blog (via /api/posts) + Backoffice (via Supabase REST)

import { headers } from "next/headers";

/* =========================
 * Tipos partilhados
 * ========================= */
export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string | null; // YYYY-MM-DD
  categories: string[] | null;
  tags: string[] | null;
  coverImage: string | null;
  status: "published" | "draft";
};

export type PostFull = PostListItem & {
  content: string | null;
  videoUrl: string | null;
};

export type CountItem = { name: string; count: number };

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string | null;
  date: string | null; // YYYY-MM-DD
  categories?: string[] | null;
  tags?: string[] | null;
  status: "published" | "draft";
  coverImage?: string | null;
};

/* =========================
 * Utils
 * ========================= */
function normStatus(s: any): "published" | "draft" {
  const v = String(s ?? "").toLowerCase().trim();
  if (v === "published" || v === "publicado") return "published";
  return "draft";
}

function baseUrlFromHeaders(): string {
  // Preferir headers do Next (server) e fallback a NEXT_PUBLIC_SITE_URL
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  const fallback =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  return fallback;
}

/* ============================================================
 *  PARTE 1 — BLOG (usa a tua rota interna /api/posts - Postgres/pg)
 * ============================================================ */
async function fetchApi<T>(path: string): Promise<T> {
  const base = baseUrlFromHeaders();
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${path}: ${res.status} ${txt}`);
  }
  return (await res.json()) as T;
}

// Lista total publicada (para paginação local)
export async function getPosts(): Promise<PostListItem[]> {
  type ApiRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content?: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string;
    image_url?: string | null;
    cover_image?: string | null;
    video_url?: string | null;
  };

  const data = await fetchApi<{
    ok: boolean;
    total: number;
    items: ApiRow[];
  }>(`/api/posts?page=1&pageSize=1000&status=published`);

  const rows = data.items ?? [];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    coverImage: (r.image_url ?? r.cover_image ?? null) as string | null,
    status: normStatus(r.status),
  }));
}

// Pesquisa (título, excerpt, content, tags, categories)
export async function searchPosts(q: string): Promise<PostListItem[]> {
  const s = q.trim();
  if (!s) return getPosts();
  type ApiRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content?: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string;
    image_url?: string | null;
    cover_image?: string | null;
    video_url?: string | null;
  };

  const data = await fetchApi<{
    ok: boolean;
    total: number;
    items: ApiRow[];
  }>(`/api/posts?q=${encodeURIComponent(s)}&page=1&pageSize=1000&status=published`);

  const rows = data.items ?? [];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    coverImage: (r.image_url ?? r.cover_image ?? null) as string | null,
    status: normStatus(r.status),
  }));
}

export async function getPostBySlug(slug: string): Promise<PostFull | null> {
  type ApiRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string;
    image_url?: string | null;
    cover_image?: string | null;
    video_url?: string | null;
  };

  // Reutiliza o GET /api/posts?q=slug e filtra, ou criares rota por slug no futuro
  const data = await fetchApi<{
    ok: boolean;
    total: number;
    items: ApiRow[];
  }>(`/api/posts?q=${encodeURIComponent(slug)}&page=1&pageSize=50&status=published`);

  const r =
    (data.items ?? []).find((x) => x.slug === slug && normStatus(x.status) === "published") ||
    null;
  if (!r) return null;

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? null,
    content: r.content ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    coverImage: (r.image_url ?? r.cover_image ?? null) as string | null,
    videoUrl: (r.video_url ?? null) as string | null,
    status: normStatus(r.status),
  };
}

// Contagens de categorias/tags e últimos posts (para sidebar)
export async function getCategoriesWithCounts(): Promise<CountItem[]> {
  const posts = await getPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const c of p.categories ?? []) {
      const key = String(c);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getTagsWithCounts(): Promise<CountItem[]> {
  const posts = await getPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      const key = String(t);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getLatestPosts(n: number): Promise<PostListItem[]> {
  const posts = await getPosts();
  return posts
    .slice()
    .sort((a, b) => {
      const ad = a.date ? new Date(a.date).getTime() : -Infinity;
      const bd = b.date ? new Date(b.date).getTime() : -Infinity;
      return bd - ad;
    })
    .slice(0, Math.max(0, n));
}

/* ============================================================
 *  PARTE 2 — BACKOFFICE (Supabase REST para CRUD direto)
 * ============================================================ */

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function ensureReadEnv() {
  if (!BASE || !ANON) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
}
function ensureWriteEnv() {
  if (!BASE || !SERVICE) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY.");
  }
}

async function restGet<T>(path: string, params: Record<string, string>) {
  ensureReadEnv();
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/rest/v1/${path}?${qs}`;
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
    throw new Error(`GET ${path}: ${res.status} ${txt}`);
  }
  return (await res.json()) as T;
}

async function restMutate<T>(
  method: "DELETE" | "PATCH" | "POST",
  path: string,
  params: Record<string, string>,
  body?: any
) {
  ensureWriteEnv();
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}/rest/v1/${path}?${qs}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${method} ${path}: ${res.status} ${txt}`);
  }
  return (await res.json().catch(() => null)) as T | null;
}

/* ------ LISTAR TODOS (BO) ------ */
export async function getAllPosts(): Promise<AdminPost[]> {
  type Row = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    content: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string | null;
    cover_image: string | null;
    cover_url: string | null;
  };

  const rows = await restGet<Row[]>("posts", {
    select:
      "id,slug,title,excerpt,summary,content,date,categories,tags,status,cover_image,cover_url",
    order: "date.desc",
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? r.summary ?? null,
    content: r.content ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    status: normStatus(r.status),
    coverImage: r.cover_image ?? r.cover_url ?? null,
  }));
}

/* ------ OBTÉM POR ID (BO) ------ */
export async function getPostById(id: string): Promise<AdminPost | null> {
  type Row = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    content: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string | null;
    cover_image: string | null;
    cover_url: string | null;
  };

  const rows = await restGet<Row[]>("posts", {
    select:
      "id,slug,title,excerpt,summary,content,date,categories,tags,status,cover_image,cover_url",
    id: `eq.${id}`,
    limit: "1",
  });
  const r = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? r.summary ?? null,
    content: r.content ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    status: normStatus(r.status),
    coverImage: r.cover_image ?? r.cover_url ?? null,
  };
}

/* ------ ATUALIZAR POR ID (BO) ------ */
export async function updatePost(
  id: string,
  payload: Partial<{
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    date: string | null; // YYYY-MM-DD
    categories: string[] | null;
    tags: string[] | null;
    status: "published" | "draft" | "publicado" | "rascunho";
    coverImage: string | null;
    videoUrl: string | null;
  }>
): Promise<AdminPost | null> {
  const body: any = {};
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.excerpt !== undefined) {
    body.excerpt = payload.excerpt;
    body.summary = payload.excerpt;
  }
  if (payload.content !== undefined) body.content = payload.content;
  if (payload.date !== undefined) body.date = payload.date;
  if (payload.categories !== undefined) body.categories = payload.categories;
  if (payload.tags !== undefined) body.tags = payload.tags;
  if (payload.status !== undefined)
    body.status =
      payload.status === "publicado"
        ? "published"
        : payload.status === "rascunho"
        ? "draft"
        : payload.status;

  if (payload.coverImage !== undefined) {
    body.cover_image = payload.coverImage;
    body.cover_url = payload.coverImage;
  }
  if (payload.videoUrl !== undefined) body.video_url = payload.videoUrl;

  type Row = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    summary: string | null;
    content: string | null;
    date: string | null;
    categories: string[] | null;
    tags: string[] | null;
    status: string | null;
    cover_image: string | null;
    cover_url: string | null;
  };

  const rows = await restMutate<Row[]>("PATCH", "posts", { id: `eq.${id}` }, body);
  const r = rows?.[0];
  if (!r) return null;

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? r.summary ?? null,
    content: r.content ?? null,
    date: r.date ?? null,
    categories: r.categories ?? [],
    tags: r.tags ?? [],
    status: normStatus(r.status),
    coverImage: r.cover_image ?? r.cover_url ?? null,
  };
}

/* ------ APAGAR POR ID (BO) ------ */
export async function deletePost(id: string): Promise<void> {
  await restMutate<null>("DELETE", "posts", { id: `eq.${id}` });
}
