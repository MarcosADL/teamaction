// components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
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
