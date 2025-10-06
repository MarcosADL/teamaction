// app/backoffice/posts/Filters.tsx
"use client";

import { useRef } from "react";

type Props = {
  qDefault: string;
  statusDefault: "all" | "draft" | "published";
  countLabel: string; // ex: "3 / 7"
};

export default function Filters({ qDefault, statusDefault, countLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = () => formRef.current?.requestSubmit();

  return (
    <form ref={formRef} method="get" className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        placeholder="Pesquisar título, slug, tags…"
        defaultValue={qDefault}
        className="border p-2 min-w-[260px]"
      />
      <select
        name="status"
        defaultValue={statusDefault}
        className="border p-2"
        aria-label="Estado"
        onChange={submit}          // 👈 auto-submete ao mudar
      >
        <option value="all">Todos</option>
        <option value="published">Publicado</option>
        <option value="draft">Rascunho</option>
      </select>

      {/* Fallback (sem JS) continua a funcionar */}
      <button type="submit" className="border px-3 py-2">Filtrar</button>

      <span className="text-gray-500 ml-auto">{countLabel}</span>
    </form>
  );
}
