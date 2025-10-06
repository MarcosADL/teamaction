import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

/**
 * Cria o cliente Supabase apenas quando necessário.
 * Em build (Vercel), se as ENV não estiverem visíveis, devolve um cliente “neutro”.
 */
export function getSupabase() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Em desenvolvimento, se faltarem variáveis, mostra erro claro
  if ((!url || !anon) && process.env.NODE_ENV !== 'production') {
    throw new Error(
      '❌ Supabase: faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  // Evita erro no build da Vercel (usa valores falsos inofensivos)
  const safeUrl = url ?? 'https://placeholder.local';
  const safeAnon = anon ?? 'invalid';

  client = createClient(safeUrl, safeAnon);
  return client;
}

