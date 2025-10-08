import Link from "next/link";
import { getPostsByTag, type PostListItem } from "@/data/posts";

type Params = { tag: string };

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  const posts: PostListItem[] = await getPostsByTag(tag);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tag: {decodeURIComponent(tag)}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">Sem artigos nesta tag.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <li key={p.slug} className="rounded-2xl border p-5 shadow-sm">
              <Link href={`/blog/${p.slug}`} className="block space-y-2">
                <h2 className="text-xl font-semibold">{p.title}</h2>
                <p className="text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
