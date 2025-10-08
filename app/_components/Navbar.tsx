"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "./useSession";
import { supabase } from "@/lib/supabase-browser";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <span className="text-lg font-bold text-primary">TeamAction</span>
        <ul className="flex gap-6 text-sm">
          <li>
            <Link
              href="/"
              className={pathname === "/" ? "text-primary font-semibold" : ""}
            >
              Início
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className={pathname?.startsWith("/blog") ? "text-primary font-semibold" : ""}
            >
              Blog
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link
                  href="/backoffice"
                  className={pathname?.startsWith("/backoffice") ? "text-primary font-semibold" : ""}
                >
                  Backoffice
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="hover:underline text-red-600"
                >
                  Sair
                </button>
              </li>
            </>
          ) : !loading ? (
            <li>
              <Link
                href="/login"
                className={pathname === "/login" ? "text-primary font-semibold" : ""}
              >
                Entrar
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
