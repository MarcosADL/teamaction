import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <html lang="pt">
      <body>
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <header className="mb-8 border-b pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Painel de Administração</h1>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/backoffice/posts" className="hover:underline">
                Posts
              </Link>
              <Link href="/backoffice/users" className="hover:underline">
                Utilizadores
              </Link>
              <Link href="/blog" className="hover:underline">
                Blog público
              </Link>
              <Link href="/" className="hover:underline">
                Início
              </Link>
              <LogoutButton />
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
