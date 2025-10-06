import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 text-center">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Página não encontrada</h1>
        <p className="mb-6 text-muted-foreground">
          O conteúdo que procuras pode ter sido removido ou mudou de endereço.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/blog" className="rounded-md border px-4 py-2 hover:bg-muted/40">
            Ir para o Blog
          </Link>
          <Link href="/" className="rounded-md border px-4 py-2 hover:bg-muted/40">
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
