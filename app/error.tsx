"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-2xl place-items-center px-4 text-center">
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Ocorreu um erro</h1>
        <p className="text-sm text-muted-foreground break-all">
          {error?.message || "Algo correu mal."}
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-muted-foreground">ID: {error.digest}</p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => reset()}
            className="rounded-md border px-3 py-1.5 hover:bg-muted/40"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-md border px-3 py-1.5 hover:bg-muted/40">
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}
