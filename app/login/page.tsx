'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/backoffice');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const n = sp.get('next');
      if (n) setNextPath(n);
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('A autenticar…');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (error) throw new Error(error.message);

      setMsg('Ok, sessão iniciada!');
      router.replace(nextPath || '/');
      router.refresh();
    } catch (err: any) {
      setMsg(`Erro: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-12 space-y-3">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="border px-3 py-2 w-full"
          placeholder="Email"
          autoComplete="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="border px-3 py-2 w-full"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} className="border px-4 py-2">
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </main>
  );
}
