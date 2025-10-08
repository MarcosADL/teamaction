// app/blog/page.tsx
import Link from "next/link";
import { getPosts, searchPosts, type PostListItem } from "@/data/posts";

export const revalidate = 60;           // ok para JSON estático
export const dynamic = "force-dynamic"; // evita cache agressiva do RSC

type SearchParams = { q?: string };

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  try {
    const q = (searchParams?.q ?? "").trim();
    const posts: PostListItem[] =
      q.length > 0 ? await searchPosts(q) : await getPosts();

    if (!posts || posts.length === 0) {
      return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="opacity-80">Ainda não há artigos.</p>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Blog</h1>
        <ul className="grid gap-4 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug} className="rounded border p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="text-sm opacity-80 mt-1">{p.excerpt}</p>
              <p className="text-xs opacity-60 mt-2">{new Date(p.date).toLocaleDateString("pt-PT")}</p>
            </li>
          ))}
        </ul>
      </main>
    );
  } catch {
    // nunca rebenta em prod
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Ocorreu um erro no Blog</h1>
        <p className="opacity-80 text-sm">Tenta voltar ao início.</p>
        <Link href="/" className="underline">Voltar ao início</Link>
      </main>
    );
  }
}
