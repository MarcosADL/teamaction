"use client";
import Link from "next/link";

export function PostMeta({
  author, date, categories = [], tags = [], readingMinutes,
  formatDate,
}: {
  author?: { name?: string; avatar?: string };
  date?: string;
  categories?: string[];
  tags?: string[];
  readingMinutes?: number;
  formatDate?: (iso?: string, locale?: string) => string;
}) {
  const dateText = date ? (formatDate ? formatDate(date, "pt-PT") : new Date(date).toLocaleDateString("pt-PT")) : undefined;
  const toSlug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {author?.name && <span>por <strong className="text-foreground">{author.name}</strong></span>}
        {dateText && <span>• {dateText}</span>}
        {readingMinutes && <span>• {readingMinutes} min</span>}
      </div>
      {!!categories.length && (
        <div className="flex flex-wrap gap-1">
          {categories.map(c => <Link key={c} href={`/categoria/${toSlug(c)}`} className="rounded border px-2 py-0.5">#{c}</Link>)}
        </div>
      )}
      {!!tags.length && (
        <div className="flex flex-wrap gap-1">
          {tags.map(t => <Link key={t} href={`/tag/${toSlug(t)}`} className="rounded border px-2 py-0.5">#{t}</Link>)}
        </div>
      )}
    </div>
  );
}
