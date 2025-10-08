import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => store.get(n)?.value } }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login?next=/backoffice");

  // (opcional) roles, ativa se precisares:
  // const u = session.user;
  // const isAdmin = (u.app_metadata?.roles as string[]|undefined)?.includes("admin") || u.user_metadata?.role === "admin";
  // if (!isAdmin) redirect("/login?next=/backoffice");

  return (
    <html lang="pt">
      <body>
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <header className="mb-8 border-b pb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Painel de Administração</h1>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/backoffice/posts" className="hover:underline">Posts</Link>
              <Link href="/backoffice/users" className="hover:underline">Utilizadores</Link>
              <Link href="/blog" className="hover:underline">Blog público</Link>
              <Link href="/" className="hover:underline">Início</Link>
              <LogoutButton />
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
