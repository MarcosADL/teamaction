// app/categoria/page.tsx
import Link from "next/link";
import { getCategoriesWithCounts } from "@/data/posts";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const cats = await getCategoriesWithCounts();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Categorias</h1>
      {cats.length === 0 ? (
        <p className="opacity-80">Ainda não há categorias.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {cats.map((c) => (
            <li key={c.category} className="rounded border px-3 py-2">
              <Link
                href={`/categoria/${encodeURIComponent(c.category)}`}
                className="hover:underline"
              >
                {c.category}
              </Link>
              <span className="ml-2 text-xs opacity-70">({c.count})</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
