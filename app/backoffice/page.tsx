// app/backoffice/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackofficeHome() {
  // ✅ Garante que só admins veem esta página
  await requireAdmin();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold">Gestão (Backoffice)</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        Escolhe uma secção:
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/backoffice/posts/new"
          className="rounded-md border px-3 py-1.5 hover:bg-muted/40"
        >
          Novo Post
        </Link>
        <Link
          href="/backoffice/posts"
          className="rounded-md border px-3 py-1.5 hover:bg-muted/40"
        >
          Listar Posts
        </Link>
        <Link
          href="/backoffice/users"
          className="rounded-md border px-3 py-1.5 hover:bg-muted/40"
        >
          Utilizadores
        </Link>
      </div>
    </main>
  );
}
