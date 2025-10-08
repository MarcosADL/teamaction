// app/blog/page.tsx
import Link from "next/link";
import { getPosts, type PostListItem } from "@/data/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  let posts: PostListItem[] = [];
  let err: string | null = null;

  try {
    posts = await getPosts();
  } catch (e: any) {
    err = e?.message ?? "Falha ao carregar posts.";
  }

  if (err) {
    // Mensagem clara + pistas de configuração
    const missingEnv: string[] = [];
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingEnv.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-red-600 font-medium mb-2">Erro a carregar posts</p>
          <p className="text-sm text-muted-foreground break-all">{err}</p>
          {missingEnv.length > 0 && (
            <p className="text-sm text-amber-600 mt-2">
              Variáveis em falta no Vercel: <code>{missingEnv.join(", ")}</code>
            </p>
          )}
          <p className="text-sm mt-2">
            Confirma também que existe a tabela <code>public.posts</code> com as colunas usadas.
          </p>
        </div>
      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Ainda não há posts publicados.</p>
        <Link className="underline" href="/backoffice/posts/new">
          Criar primeiro post
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="rounded-lg border border-border bg-card p-4">
            <Link href={`/blog/${p.slug}`} className="text-lg font-semibold text-primary hover:underline">
              {p.title}
            </Link>
            <div className="text-sm text-muted-foreground">
              {new Date(p.date).toLocaleDateString("pt-PT")}
            </div>
            {p.excerpt && <p className="text-sm mt-1 text-foreground/80">{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
