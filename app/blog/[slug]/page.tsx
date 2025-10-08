// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug } from "@/lib/posts";
import YouTubeEmbed from "@/components/youtube-embed";
import { getYouTubeId } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado — TeamAction" };

  const title = post.title;
  const description =
    post.excerpt || "Artigo do Blog TeamAction sobre treino, tática e gestão.";
  const ogImage = post.coverImage || "/og/post-og.svg";
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://example.com";
  const url = `${base}/blog/${post.slug}`;

  return {
    title: `${title} — TeamAction`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const ytId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-6">
      {post.coverImage ? (
        <div className="mb-6 overflow-hidden rounded-xl">
          <img
            src={post.coverImage}
            alt=""
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      {post.date ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {new Date(post.date).toLocaleDateString("pt-PT")}
        </p>
      ) : null}

      {ytId ? (
        <div className="mb-6 overflow-hidden rounded-xl">
          <YouTubeEmbed id={ytId} title={post.title} />
        </div>
      ) : null}

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content ?? ""}
        </ReactMarkdown>
      </div>
    </article>
  );
}
