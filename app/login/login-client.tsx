'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginClient() {
  const router = useRouter();

  const [next, setNext] = useState('/');
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setNext(sp.get('next') ?? '/');
    } catch {}
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (error) throw new Error(error.message);

      router.replace(next || '/');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Entrar</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md border px-4 py-2 hover:bg-muted/40 disabled:opacity-60"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
