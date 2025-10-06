import Link from "next/link";
import { getSession } from "@/lib/auth";

function firstName(name?: string) {
  if (!name) return "";
  const [f] = name.split(" ");
  return f;
}

export default async function SiteHeader() {
  // getSession lê o cookie "session" e devolve {id,email,name,role} | null
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          TeamAction
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>

          {/* Só admins vêm o Backoffice */}
          {session?.role === "admin" && (
            <Link href="/backoffice" className="hover:underline">
              Backoffice
            </Link>
          )}

          {/* Área de sessão */}
          {session ? (
            <>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
                  {firstName(session.name).slice(0, 2).toUpperCase() || "AD"}
                </span>
                Olá, {firstName(session.name) || "Admin"}
              </span>

              {/* >>> AQUI está o “Sair” (GET para a rota que redireciona) */}
              <a
                href="/api/auth/signout"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40"
              >
                Sair
              </a>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40"
              >
                Registar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
