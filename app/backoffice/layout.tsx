import Link from "next/link";
import { ReactNode } from "react";
import { getSession } from "@/lib/auth";

export default async function BackofficeLayout({ children }: { children: ReactNode }) {
  const me = await getSession();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">Backoffice</span>
            <span className="text-sm text-muted-foreground">{me ? `Olá, ${me.name}` : ""}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/backoffice" className="rounded-md px-3 py-1.5 hover:bg-muted/40">Posts</Link>
            <Link href="/backoffice/posts/new" className="rounded-md border px-3 py-1.5 hover:bg-muted/40">Novo Post</Link>
            <Link href="/backoffice/users" className="rounded-md border px-3 py-1.5 hover:bg-muted/40">Utilizadores</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
