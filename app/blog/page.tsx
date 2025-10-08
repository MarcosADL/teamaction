// app/blog/page.tsx
import Link from "next/link";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

type Post = { id: string; slug: string; title: string; excerpt: string|null; date: string|null; coverImage?: string|null; };

async function fetchPosts(q?: string): Promise<Post[]> {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;
  const url = new URL(`${base}/api/posts`);
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "100");
  if (q?.trim()) url.searchParams.set("q", q.trim());

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API /api/posts: ${res.status} ${await res.text().catch(()=> "")}`);
  const data = await res.json();
  return (data.items ?? []).map((p: any) => ({
    id: p.id, slug: p.slug, title: p.title,
    excerpt: p.excerpt ?? null, date: p.date ?? null, coverImage: p.image_url ?? p.cover_image ?? null,
  }));
}

export default async function BlogPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";
  let posts: Post[] = []; let err: string|null = null;

  try { posts = await fetchPosts(q); } catch (e:any) { err = e?.message ?? "Erro ao carregar posts."; }

  if (err) {
    return (
      <main className="space-y-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-red-600 text-sm">{err}</p>
        <p className="text-sm">Abre <code>/api/health</code> para verificar ligação à base de dados.</p>
      </main>
    );
  }

  if (!posts.length) {
    return (
      <main className="space-y-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Ainda não há posts.</p>
        <Link className="underline" href="/backoffice/posts/new">Criar primeiro post</Link>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map(p => (
          <li key={p.id} className="border rounded-xl p-4">
            <Link href={`/blog/${p.slug}`} className="text-lg font-semibold underline">{p.title}</Link>
            {p.date && <div className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString("pt-PT")}</div>}
            {p.excerpt && <p className="text-sm text-gray-600 mt-1">{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
