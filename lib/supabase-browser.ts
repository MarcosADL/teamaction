// lib/supabase-browser.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // tem de existir no Vercel
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // idem
);
