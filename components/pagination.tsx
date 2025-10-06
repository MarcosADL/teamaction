// components/pagination.tsx
"use client";

type Props = {
  page: number;          // página atual (1-based)
  total: number;         // total de itens
  perPage: number;       // itens por página
  onChange: (page: number) => void;
};

export default function Pagination({ page, total, perPage, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
        disabled={prevDisabled}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </button>

      <span className="text-sm">
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>

      <button
        type="button"
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
        disabled={nextDisabled}
        onClick={() => onChange(page + 1)}
      >
        Seguinte
      </button>
    </div>
  );
}
