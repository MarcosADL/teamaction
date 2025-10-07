'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '../../lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('A autenticar…');
    setLoading(true);

    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setLoading(false);
      setMsg('ERRO: ' + error.message); // mostra o erro real do Supabase
      return;
    }

    // ✅ Criar cookie de sessão para o middleware deixar passar
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // por agora, força admin; depois puxamos da metadata do user
      body: JSON.stringify({ role: 'admin' }),
    });

    setLoading(false);

    if (!res.ok) {
      setMsg('Sessão criada no Supabase, mas falhou criar cookie local.');
      return;
    }

    setMsg('Ok, sessão iniciada!');
    router.push('/backoffice'); // agora passa no middleware
  }

  return (
    <main className="max-w-md mx-auto py-12 space-y-3">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input className="border px-3 py-2 w-full" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border px-3 py-2 w-full" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="border px-4 py-2">
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}
