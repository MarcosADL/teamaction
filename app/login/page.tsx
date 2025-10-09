// app/login/page.tsx
'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { useState } from 'react';// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      router.replace('/'); // ou '/backoffice'
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Entrar</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="email@exemplo.pt"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Palavra-passe</label>
          <input
            type="password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="••••••••"
          />
        </div>

        {err && (
          <p className="text-sm text-red-600">{err}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md px-3 py-2 border"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(error.message);
        return;
      }
      // redireciona para onde te der mais jeito
      router.replace('/backoffice');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Erro inesperado no login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sessão</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {err && (
          <p className="rounded-md border border-red-400 bg-red-50 p-2 text-sm">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border px-3 py-2 font-medium disabled:opacity-60"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
