"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function RegisterPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const emailInvalid = email.length > 0 && !isEmail(email);
  const pwInvalid = password.length > 0 && password.length < 6;
  const disabled =
    loading || !name.trim() || !email.trim() || !password || emailInvalid || pwInvalid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Falha no registo (${res.status})`);
      router.replace(next || "/");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
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

        <button
          type="submit"
          disabled={disabled}
          className="rounded-md border px-4 py-2 hover:bg-muted/40 disabled:opacity-60"
        >
          {loading ? "A criar…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Já tens conta?{" "}
        <a
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline"
        >
          Entrar
        </a>
      </p>
    </main>
  );
}
