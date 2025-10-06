"use client";

import { useMemo } from "react";

export type BlogFiltersValue = {
  q: string;
  category: string;
  tag: string;
  type: "" | "article" | "video" | "tip";
};

export function BlogFilters({
  value,
  onChange,
  categories,
  tags,
}: {
  value: BlogFiltersValue;
  onChange: (v: BlogFiltersValue) => void;
  categories: string[];
  tags: string[];
}) {
  const uniqueCats = useMemo(() => Array.from(new Set(categories)).sort(), [categories]);
  const uniqueTags = useMemo(() => Array.from(new Set(tags)).sort(), [tags]);

  return (
    <form className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="Pesquisar…"
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
      />

      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      >
        <option value="">Todas as categorias</option>
        {uniqueCats.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value.tag}
        onChange={(e) => onChange({ ...value, tag: e.target.value })}
      >
        <option value="">Todas as tags</option>
        {uniqueTags.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value as "" | "article" | "video" | "tip" })}
      >
        <option value="">Todos os tipos</option>
        <option value="article">Artigos</option>
        <option value="video">Vídeos</option>
        <option value="tip">Dicas</option>
      </select>
    </form>
  );
}
