import Link from "next/link";
import type { CountItem, PostListItem } from "@/data/posts";
import CategoryBadge from "@/components/category-badge";

type Props = {
  cats: CountItem[];
  tags: CountItem[];
  latest: PostListItem[];
};

export default function Sidebar({ cats, tags, latest }: Props) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">
          CATEGORIAS
        </h2>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <CategoryBadge
              key={c.name}
              name={c.name}
              href={`/blog?categoria=${encodeURIComponent(c.name)}`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {cats.reduce((n, c) => n + c.count, 0)} artigos no total
        </p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">
          TAGS
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.name}
              href={`/blog?q=${encodeURIComponent(t.name)}`}
              className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm hover:border-primary/50"
            >
              <span>#{t.name}</span>
              <span className="text-xs text-muted-foreground">({t.count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">
          RECENTES
        </h2>
        <ul className="space-y-2">
          {latest.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block rounded-md px-2 py-1 text-sm hover:bg-muted/40"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
