// app/blog/error.tsx
"use client";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Ocorreu um erro no Blog</h1>
      <p className="opacity-75 text-sm">
        ID: {error?.digest ?? "—"}
      </p>
      <button
        className="mt-4 rounded border px-4 py-2"
        onClick={() => reset()}
      >
        Tentar de novo
      </button>
    </main>
  );
}
