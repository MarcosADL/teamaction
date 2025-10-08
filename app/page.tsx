// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          TeamAction
        </h1>
        <p className="text-lg text-muted-foreground">
          Plataforma para clubes e equipas amadoras.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Ir para o Blog
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition"
          >
            Registar
          </Link>
        </div>
      </div>
    </main>
  );
}
