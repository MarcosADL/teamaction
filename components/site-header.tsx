import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton"; // <-- novo

function firstName(name?: string) {
  if (!name) return "";
  const [f] = name.split(" ");
  return f;
}

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">TeamAction</Link>

        <nav className="flex items-center gap-4">
          <Link href="/blog" className="hover:underline">Blog</Link>

          {session?.role === "admin" && (
            <Link href="/backoffice" className="hover:underline">Backoffice</Link>
          )}

          {session ? (
            <>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
                  {firstName(session.name).slice(0, 2).toUpperCase() || "AD"}
                </span>
                Olá, {firstName(session.name) || "Admin"}
              </span>

              {/* antes: <a href="/api/auth/signout">Sair</a> */}
              <LogoutButton />  {/* <-- usa o botão cliente */}
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Entrar</Link>
              <Link href="/register" className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40">
                Registar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
