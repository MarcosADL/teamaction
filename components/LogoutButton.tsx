// components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser'; // <- instância (sem ())

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      // 1) apaga o cookie usado pelo middleware
      await fetch('/api/create-session', {
        method: 'DELETE',
        credentials: 'include',
      });

      // 2) termina a sessão do Supabase no browser
      await supabase.auth.signOut();

      // 3) volta à home (ou onde quiseres)
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40 disabled:opacity-60"
    >
      {loading ? 'A sair…' : 'Sair'}
    </button>
  );
}
