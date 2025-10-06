// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Falha explícita se faltar algo (no AMBIENTE, não em ficheiro)
if (!url || !anon) {
  throw new Error(
    'Supabase: faltam NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente (Vercel Settings → Environment Variables).'
  );
}

export const supabase = createClient(url, anon);
