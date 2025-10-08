// app/backoffice/layout.tsx
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Garante que só o admin autenticado acede
  try {
    await requireAdmin();
  } catch {
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-red-600">
          Acesso restrito
        </h1>
        <p className="mb-6 text-muted-foreground">
          Precisas de uma conta de administrador para aceder ao Backoffice.
        </p>
        <Link
          href="/login"
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted/40"
        >
          Ir para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-8 border-b pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel de Administração</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/backoffice/posts" className="hover:underline">
            Posts
          </Link>
          <Link href="/blog" className="hover:underline">
            Blog público
          </Link>
          <Link href="/" className="hover:underline">
            Início
          </Link>
        </nav>
      </header>

      {/* conteúdo das páginas filhas */}
      {children}
    </main>
  );
}
