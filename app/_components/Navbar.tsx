"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { useSession } from "./useSession";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const itemCls = (active: boolean) =>
    `hover:text-primary transition ${active ? "text-primary font-semibold" : ""}`;

  return (
    <header className="w-full border-b border-border bg-card text-card-foreground sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          TeamAction
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/blog" className={itemCls(pathname?.startsWith("/blog") ?? false)}>
            Blog
          </Link>
          <Link href="/sobre" className={itemCls(pathname === "/sobre")}>
            Sobre
          </Link>

          {user ? (
            <>
              <Link
                href="/backoffice"
                className={itemCls(pathname?.startsWith("/backoffice") ?? false)}
              >
                Backoffice
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Sair
              </button>
            </>
          ) : !loading ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Entrar
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
