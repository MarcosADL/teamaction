// app/categoria/[category]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsByCategory, type PostListItem } from "@/data/posts";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const name = decodeURIComponent(params.category);
  const posts: PostListItem[] = await getPostsByCategory(name);
  if (!posts || posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{name}</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <li key={p.slug} className="rounded border p-4">
            <h2 className="text-lg font-semibold">
              <Link href={`/blog/${p.slug}`} className="hover:underline">
                {p.title}
              </Link>
            </h2>
            <p className="text-sm opacity-80">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
