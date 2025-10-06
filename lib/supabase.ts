// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Cria o cliente apenas quando usado.
 * No build (Vercel), se as ENV não estiverem visíveis por algum motivo,
 * NÃO lança erro – devolve um cliente “inócuo” para o build passar.
 * Em runtime sem ENV, lança erro claro.
 */
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se faltar em runtime (servidor/preview), falha claramente
  if ((!url || !anon) && process.env.NODE_ENV !== 'production') {
    throw new Error(
      'Supabase: faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.'
    );
  }

  // Em produção (inclui fase de build no Vercel), evita rebentar o build
  // mesmo que as ENV não sejam lidas nesta fase.
  const safeUrl = url ?? 'https://invalid.local';
  const safeAnon = anon ?? 'invalid';

  return createClient(safeUrl, safeAnon);
}
