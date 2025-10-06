"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function RegisterClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailInvalid = email.length > 0 && !isEmail(email);
  const pwInvalid = password.length > 0 && password.length < 6;
  const disabled =
    loading || !name.trim() || !email.trim() || !password || emailInvalid || pwInvalid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setErr("");
    setOk(false);
    setLoading(true);

    const supabase = getSupabase();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    setLoading(false);

    if (error) {
      setErr(error.message || "Erro no registo");
      return;
    }

    setOk(true);
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Criar conta</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Nome</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-invalid={emailInvalid || undefined}
          />
          {emailInvalid && <p className="mt-1 text-xs text-red-600">Email inválido.</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
            aria-invalid={pwInvalid || undefined}
          />
          <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && (
          <p className="text-sm text-green-700">
            Verifica o teu e-mail para concluir o registo.
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="rounded-md border px-4 py-2 hover:bg-muted/40 disabled:opacity-60"
        >
          {loading ? "A criar…" : "Criar conta"}
        </button>
      </form>
    </main>
  );
}
