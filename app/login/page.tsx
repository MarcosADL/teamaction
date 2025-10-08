// app/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const s = await getSession();
  const next = searchParams?.next || "/";

  if (s.authenticated) {
    // já logado → segue para o destino
    redirect(next);
  }

  // --- FORMULÁRIO SIMPLES ---
  return (
    <main className="mx-auto max-w-md px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form action="/api/auth/signin" method="post" className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            className="w-full rounded border px-3 py-2 bg-neutral-900"
            placeholder="o.teu@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Palavra-passe</label>
          <input
            name="password"
            type="password"
            className="w-full rounded border px-3 py-2 bg-neutral-900"
            required
          />
        </div>
        <button className="rounded border px-4 py-2">Entrar</button>
      </form>
    </main>
  );
}
