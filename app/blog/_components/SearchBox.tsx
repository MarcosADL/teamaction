"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button"; // ✅ corrigido

export default function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    const value = q.trim();
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`/blog?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Procurar por título ou tag…"
        className="h-10 w-full max-w-xl rounded-lg border px-3 outline-none focus:border-primary/50"
      />
      <Button type="submit">Pesquisar</Button>
    </form>
  );
}
