"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fallback: se já houver sessão no browser, vai já embora
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (data.session) window.location.assign(nextPath);
    })();
    return () => {
      alive = false;
    };
  }, [nextPath]);

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
      window.location.assign(nextPath); // nova request → cookies SSR
    } catch (err: any) {
      setMsg(`Erro: ${err?.message ?? "Falha ao autenticar."}`);
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
        <button disabled={loading} className="border rounded-xl px-4 py-2 w-full">
          {loading ? "A entrar…" : "Entrar"}
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
