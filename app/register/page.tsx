// app/register/page.tsx
'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 20000); // timeout 20s para não “colar”

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: ac.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Erro ${res.status}`);
      }

      setMsg('Conta criada. Verifica o teu e-mail para confirmar.');
      setName(''); setEmail(''); setPassword('');
    } catch (err: any) {
      setMsg(err?.name === 'AbortError' ? 'Tempo esgotado. Tenta de novo.' : (err?.message || 'Falha no registo.'));
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-semibold">Criar conta</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nome</label>
          <input value={name} onChange={e=>setName(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded border"
        >
          {loading ? 'A criar…' : 'Registar'}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </main>
  );
}
