// app/backoffice/layout.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackofficeLayout({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?next=/backoffice");
  }

  const user = session.user;
  const isAdmin =
    (user.app_metadata?.roles as string[] | undefined)?.includes("admin") ||
    user.user_metadata?.role === "admin";

  if (!isAdmin) {
    redirect("/login?next=/backoffice");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-8 border-b pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel de Administração</h1>
        <nav className="flex items-center gap-4 text-sm">
          <a href="/backoffice/posts" className="hover:underline">Posts</a>
          <a href="/blog" className="hover:underline">Blog público</a>
          <a href="/" className="hover:underline">Início</a>
        </nav>
      </header>
      {children}
    </main>
  );
}
