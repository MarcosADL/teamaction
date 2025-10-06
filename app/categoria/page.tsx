// app/categoria/[categoria]/page.tsx
import Link from "next/link";
import { getPostsByCategory, type PostListItem } from "@/data/posts";

export const revalidate = 60;

export default async function CategoriaPage({ params }: { params: { categoria: string } }) {
  const cat = decodeURIComponent(params.categoria ?? "");
  const posts: PostListItem[] = await getPostsByCategory(cat);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Categoria: {cat}</h1>
      {posts.length === 0 ? (
        <p>Não foram encontrados artigos nesta categoria.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.slug} className="border rounded p-3">
              <Link href={`/blog/${p.slug}`} className="text-xl font-semibold underline">
                {p.title}
              </Link>
              {p.excerpt && <p className="mt-2 text-sm">{p.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
