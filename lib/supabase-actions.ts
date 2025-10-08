// lib/supabase-actions.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function supabaseForActions() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const store = cookies();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try { store.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { store.set({ name, value: "", ...options }); } catch {}
      },
    },
  });
}
