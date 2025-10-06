// app/auth/callback/callback-client.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/backoffice";

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase();

      // Se existir, troca o código do URL por sessão (covers verify/magic link)
      const anyAuth = supabase.auth as any;
      if (typeof anyAuth.exchangeCodeForSession === "function") {
        try {
          await anyAuth.exchangeCodeForSession(window.location.href);
        } catch {}
      }

      const { data: { session } } = await supabase.auth.getSession();
      router.replace(session ? next : "/login");
    };
    run();
  }, [router, next]);

  return null;
}
