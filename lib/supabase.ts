// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 👉 NUNCA usar placeholders em produção
  if (!url || !anon) {
    throw new Error(
      'Supabase: faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  client = createClient(url, anon);
  return client;
}
