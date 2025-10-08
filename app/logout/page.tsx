'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        router.replace('/');
        router.refresh();
      }
    })();
  }, [router]);

  return (
    <main className="mx-auto max-w-md px-4 py-12 text-center">
      <p>A sair…</p>
    </main>
  );
}
