import Link from "next/link";

export type PostCardPost = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string;         // preferido
  publishedAt?: string;  // compat antigo
  categories?: string[];
  tags?: string[];
  coverImage?: string;
};

export default function PostCard({ post }: { post: PostCardPost }) {
  const when = post.date ?? post.publishedAt ?? "";

  return (
    <article className="overflow-hidden rounded-xl border transition-all hover:border-primary/50 hover:shadow-sm">
      {post.coverImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={post.coverImage}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-5">
        <header className="mb-3">
          <h2 className="text-lg font-semibold leading-snug">
            <Link href={`/blog/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>
          {when ? <p className="mt-1 text-xs text-muted-foreground">{when}</p> : null}
        </header>

        {post.excerpt ? (
          <p className="mb-4 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(post.categories ?? []).map((c) => (
            <span key={`c-${post.slug}-${c}`} className="rounded-full border px-2 py-0.5 text-xs">
              {c}
            </span>
          ))}
          {(post.tags ?? []).map((t) => (
            <span key={`t-${post.slug}-${t}`} className="rounded-full border px-2 py-0.5 text-xs">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
