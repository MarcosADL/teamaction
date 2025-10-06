import Link from "next/link";
import {
  getPosts,
  searchPosts,
  type PostListItem,
  getCategoriesWithCounts,
  getTagsWithCounts,
  getLatestPosts,
} from "@/lib/posts";
import SearchBox from "./_components/SearchBox";
import Pagination from "./_components/Pagination";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);

  const [allPosts, cats, tags, latest] = await Promise.all([
    q && q.trim().length > 0 ? searchPosts(q.trim()) : getPosts(),
    getCategoriesWithCounts(),
    getTagsWithCounts(),
    getLatestPosts(5),
  ]);

  const total = allPosts.length;
  const start = (page - 1) * PAGE_SIZE;
  const posts = allPosts.slice(start, start + PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-bold">Blog</h1>

      <div className="mb-6">
        <SearchBox />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Lista de posts */}
        <section className="space-y-4">
          {(!posts || posts.length === 0) ? (
            <div className="rounded-xl border p-8 text-center">
              <p className="mb-2 text-lg font-medium">Sem resultados</p>
              {q ? (
                <p className="text-sm text-muted-foreground">
                  Não encontrámos artigos para <span className="font-medium">“{q}”</span>. Tenta outro termo.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ainda não há artigos nesta página.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((p: PostListItem) => (
                  <article
                    key={p.slug}
                    className="overflow-hidden rounded-xl border transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    {p.coverImage ? (
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={p.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}

                    <div className="p-5">
                      <header className="mb-3">
                        <h2 className="text-lg font-semibold leading-snug line-clamp-2">
                          <Link href={`/blog/${p.slug}`} className="hover:underline">
                            {p.title}
                          </Link>
                        </h2>
                        {p.date ? (
                          <p className="mt-1 text-xs text-muted-foreground">{p.date}</p>
                        ) : null}
                      </header>

                      {p.excerpt ? (
                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        {(p.categories ?? []).map((c) => (
                          <span key={`c-${p.slug}-${c}`} className="rounded-full border px-2 py-0.5 text-xs">
                            {c}
                          </span>
                        ))}
                        {(p.tags ?? []).map((t) => (
                          <span key={`t-${p.slug}-${t}`} className="rounded-full border px-2 py-0.5 text-xs">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Pagination total={total} page={page} pageSize={PAGE_SIZE} q={q} />
            </>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-8">
          <section className="rounded-xl border p-4">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">
              CATEGORIAS
            </h2>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c.name}
                  href={`/blog?q=${encodeURIComponent(c.name)}`}
                  className="rounded-full border px-2 py-0.5 text-xs"
                >
                  {c.name} <span className="text-muted-foreground">({c.count})</span>
                </Link>
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
                  className="rounded-full border px-2 py-0.5 text-xs"
                >
                  #{t.name}{" "}
                  <span className="text-muted-foreground">({t.count})</span>
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
        </aside>
      </div>
    </main>
  );
}
