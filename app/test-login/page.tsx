'use client';

import { useState } from 'react';

export default function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [log, setLog] = useState<string[]>([]);

  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  function push(m: string) {
    setLog((l) => [...l, m]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLog([]);

    try {
      push(`ENV URL ok? ${!!URL}`);
      push(`ENV ANON ok? ${!!ANON}`);

      // 1) Login direto no Supabase (sem SDK)
      const url = `${URL}/auth/v1/token?grant_type=password`;
      push(`POST ${url}`);

      const authRes = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: ANON,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      push(`Supabase status: ${authRes.status}`);
      const authJson = await authRes.json().catch(() => ({}));
      push(`Supabase body: ${JSON.stringify(authJson).slice(0, 300)}`);

      if (!authRes.ok) return;

      // 2) Criar cookie de sessão (para o middleware)
      push('POST /api/create-session');
      const sess = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',            // <- IMPORTANTE para Set-Cookie
        body: JSON.stringify({ role: 'admin' }),
      });
      push(`session status: ${sess.status}`);
    } catch (err: any) {
      push('ERRO: ' + (err?.message || String(err)));
    }
  }

  return (
    <main className="max-w-md mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold">Test Login</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="border px-3 py-2 w-full"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-full"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="border px-4 py-2">Testar</button>
      </form>

      <pre className="whitespace-pre-wrap text-sm border rounded p-2 bg-gray-50">
        {log.join('\n')}
      </pre>
    </main>
  );
}
