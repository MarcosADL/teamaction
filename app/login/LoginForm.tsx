"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase-browser";
import { loginAction } from "./actions";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Fallback: se já houver sessão no browser, redireciona
  useEffect(() => {
    let live = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!live) return;
      if (data.session) window.location.assign(nextPath);
    })();
    return () => { live = false; };
  }, [nextPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("A autenticar…");
    startTransition(async () => {
      const res = await loginAction(
        new FormData(e.target as HTMLFormElement)
      );
      if (res?.ok === false) setMsg(`Erro: ${res.message}`);
      // se ok, a action faz redirect server-side
    });
  }

  return (
    <main className="max-w-md mx-auto p-6 py-12 space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="hidden" name="next" value={nextPath} />
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
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
            name="password"
            className="border rounded-xl px-3 py-2 w-full"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button disabled={pending} className="border rounded-xl px-4 py-2 w-full">
          {pending ? "A entrar…" : "Entrar"}
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
