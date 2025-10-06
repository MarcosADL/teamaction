// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">TeamAction</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Plataforma para clubes e equipas amadoras.
      </p>

      <ul className="mt-6 list-disc pl-5 space-y-1">
        <li>
          <Link href="/blog" className="underline">
            Ir para o Blog
          </Link>
        </li>
        <li>
          <Link href="/register" className="underline">
            Registar
          </Link>
        </li>
      </ul>
    </main>
  );
}
