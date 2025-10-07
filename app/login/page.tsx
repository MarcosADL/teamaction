'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState('/backoffice');
  const router = useRouter();

  // ler ?next=... sem useSearchParams
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
      // 1) Login no Supabase
      const { data, error } = await supabaseBrowser().auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        setMsg(`Supabase: ${error.message}`);
        return;
      }

      // 2) Criar cookie para o middleware
      const res = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: 'admin' }),
      });

      if (!res.ok) {
        // mostrar mensagem exata do servidor
        let errText = '';
        try { errText = await res.text(); } catch {}
        setMsg(`Cookie falhou: HTTP ${res.status} ${errText || ''}`.trim());
        return;
      }

      setMsg('Ok, sessão iniciada!');
      router.replace(nextPath);
    } catch (err: any) {
      // mostra erro real em vez de "inesperado"
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
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-full"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button disabled={loading} className="border px-4 py-2">
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </main>
  );
}
