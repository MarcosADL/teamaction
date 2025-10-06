import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Params = { slug: string };

async function getCategory(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getPostsByCategory(slug: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      published_at,
      categories:categories!inner(name,slug)
    `
    )
    .eq("status", "published")
    .eq("categories.slug", slug)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = params;

  const category = await getCategory(slug);
  if (!category) notFound();

  const posts = await getPostsByCategory(slug);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">
        Categoria: <span className="underline">{category.name}</span>
      </h1>

      {posts.length === 0 && (
        <p className="text-sm text-gray-500">Ainda não há artigos nesta categoria.</p>
      )}

      <ul className="space-y-6">
        {posts.map((p: any) => (
          <li key={p.id} className="rounded-lg border p-5">
            <h2 className="text-xl font-medium">
              <Link href={`/blog/${p.slug}`} className="underline">
                {p.title}
              </Link>
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {p.published_at
                ? new Date(p.published_at).toLocaleDateString("pt-PT")
                : "Sem data"}
              {" · "}
              {p.categories?.name ?? category.name}
            </p>

            {p.excerpt && <p className="mt-3 text-sm text-gray-700">{p.excerpt}</p>}

            <div className="mt-4">
              <Link
                href={`/blog/${p.slug}`}
                className="inline-block rounded border px-3 py-1 text-sm underline"
              >
                Ler artigo
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link href="/blog" className="underline">
          Voltar ao blog
        </Link>
      </div>
    </main>
  );
}
