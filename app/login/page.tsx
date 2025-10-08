// app/login/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

function sanitizeNext(next: string | null | undefined) {
  if (!next) return "/backoffice";
  // só aceita paths relativos dentro do site
  if (!next.startsWith("/") || next.startsWith("//")) return "/backoffice";
  // opcional: evita navegar para /login novamente
  if (next === "/login") return "/backoffice";
  return next;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(
    () => sanitizeNext(searchParams.get("next")),
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se já houver sessão, redireciona
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        router.replace(nextPath);
        router.refresh();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, nextPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("A autenticar…");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (error) throw new Error(error.message);
      setMsg("Sessão iniciada!");
      router.replace(nextPath);
      router.refresh();
    } catch (err: any) {
      setMsg(`Erro: ${err?.message || "Falha ao autenticar."}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 py-12 space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="border rounded-xl px-3 py-2 w-full"
            placeholder="o.teu@email.com"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Palavra-passe</label>
          <input
            className="border rounded-xl px-3 py-2 w-full"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="border rounded-xl px-4 py-2 w-full"
        >
          {loading ? "A entrar…" : "Entrar"}
        </button>
      </form>

      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
