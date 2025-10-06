// app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/backoffice";

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabase();

      // Se existir este método na versão do SDK, usa-o:
      if (typeof (supabase.auth as any).exchangeCodeForSession === "function") {
        await (supabase.auth as any).exchangeCodeForSession(window.location.href);
      }

      const { data: { session } } = await supabase.auth.getSession();
      router.replace(session ? next : "/login");
    };
    run();
  }, [router, next]);

  return <main className="p-6 text-center">A confirmar sessão…</main>;
}
