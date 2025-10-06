"use client";

import Link from "next/link";
import { useMemo } from "react";

type Props = {
  total: number;
  page: number;      // 1-based
  pageSize: number;
  q?: string;
};

export default function Pagination({ total, page, pageSize, q }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const makeHref = (p: number) => {
    const usp = new URLSearchParams();
    if (p > 1) usp.set("page", String(p));
    if (q) usp.set("q", q);
    const qs = usp.toString();
    return qs ? `/blog?${qs}` : "/blog";
    // mantém /blog como rota base
  };

  // janela compacta de páginas
  const windowPages = useMemo(() => {
    const arr: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    if (!arr.includes(1)) arr.unshift(1);
    if (!arr.includes(pages)) arr.push(pages);
    return Array.from(new Set(arr)).sort((a, b) => a - b);
  }, [page, pages]);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      <Link
        aria-disabled={page === 1}
        className={`rounded-md border px-3 py-1 text-sm ${
          page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted/40"
        }`}
        href={makeHref(Math.max(1, page - 1))}
      >
        Anterior
      </Link>

      {windowPages.map((p, i) => {
        const prev = windowPages[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            <Link
              href={makeHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={`rounded-md border px-3 py-1 text-sm ${
                p === page ? "bg-foreground text-background" : "hover:bg-muted/40"
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        aria-disabled={page === pages}
        className={`rounded-md border px-3 py-1 text-sm ${
          page === pages ? "pointer-events-none opacity-50" : "hover:bg-muted/40"
        }`}
        href={makeHref(Math.min(pages, page + 1))}
      >
        Seguinte
      </Link>
    </nav>
  );
}
