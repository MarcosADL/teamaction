"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type AppRole = "user" | "admin";

export default function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      const u = data.user ?? null;
      setEmail(u?.email ?? null);
      const r =
        ((u?.app_metadata as any)?.role as AppRole | undefined) ??
        ((u?.user_metadata as any)?.role as AppRole | undefined) ??
        "user";
      setRole(r);
    }

    load();
    // opcional: reagir a mudanças de sessão
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b border-neutral-800">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="text-green-400 font-semibold">TeamAction</Link>
        <Link href="/blog" className="hover:underline">Blog</Link>
        <Link href="/sobre" className="hover:underline">Sobre</Link>

        <div className="ml-auto flex items-center gap-3">
          {role === "admin" && (
            <Link href="/backoffice" className="hover:underline">
              Backoffice
            </Link>
          )}

          {email ? (
            <Link href="/logout" className="bg-red-600 text-white px-3 py-1 rounded">
              Sair
            </Link>
          ) : (
            <Link href="/login" className="bg-green-500 text-black px-3 py-1 rounded">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
