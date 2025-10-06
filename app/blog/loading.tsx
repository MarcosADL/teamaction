export default function BlogLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-10 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border">
            <div className="aspect-[16/9] w-full animate-pulse bg-muted" />
            <div className="space-y-2 p-5">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="flex gap-2 pt-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
