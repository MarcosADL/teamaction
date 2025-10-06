import Link from "next/link";
import { getTagsWithCounts, type CountItem } from "@/data/posts";

export const revalidate = 60;

export default async function TagsIndex() {
  const tags = await getTagsWithCounts();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map((t: CountItem) => (
          <Link
            key={t.name}
            href={`/tag/${encodeURIComponent(t.name)}`}
            className="rounded-full border px-3 py-1 text-sm"
          >
            {t.name} ({t.count})
          </Link>
        ))}
      </div>
    </section>
  );
}
