// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/data/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60;

type Params = { slug: string };

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <article className="space-y-6">
        <header className="space-y-2 border-b pb-4">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-sm opacity-70">
            {new Date(post.date).toLocaleDateString("pt-PT")}
          </p>
        </header>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full rounded-lg"
          />
        )}

        {post.videoUrl && (
          <div className="aspect-video">
            <iframe
              src={post.videoUrl.replace("watch?v=", "embed/")}
              title={post.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="border-t pt-4 text-sm opacity-70 space-y-2">
          {post.categories?.length > 0 && (
            <p>
              <strong>Categorias:</strong> {post.categories.join(", ")}
            </p>
          )}
          {post.tags?.length > 0 && (
            <p>
              <strong>Tags:</strong> {post.tags.join(", ")}
            </p>
          )}
        </footer>
      </article>

      <div className="pt-6">
        <Link
          href="/blog"
          className="inline-block rounded border px-3 py-1 hover:bg-neutral-800"
        >
          ← Voltar ao blog
        </Link>
      </div>
    </main>
  );
}
