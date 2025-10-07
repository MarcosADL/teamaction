// app/login/page.tsx  (ou app/entrar/page.tsx)
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

  // Lê ?next=... no cliente (sem useSearchParams)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const n = sp.get('next');
      if (n && typeof n === 'string') setNextPath(n);
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('A autenticar…');
    setLoading(true);
    try {
      // 1) Login no Supabase (browser)
      const { error } = await supabaseBrowser().auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) { setMsg('ERRO: ' + error.message); return; }

      // 2) Criar cookie para o middleware
      const res = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: 'admin' }), // depois puxamos role real
      });
      if (!res.ok) { setMsg('Sessão criada no Supabase, mas falhou cookie local.'); return; }

      setMsg('Ok, sessão iniciada!');
      router.replace(nextPath);
    } catch {
      setMsg('Erro inesperado no login.');
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
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="border px-3 py-2 w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button disabled={loading} className="border px-4 py-2">
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
