"use client";

import { useState, useTransition } from "react";

export default function DeleteButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-red-50"
      >
        Remover
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="submit"
        onClick={() => startTransition(() => {})}
        disabled={pending}
        className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "A remover…" : "Confirmar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted/40"
      >
        Cancelar
      </button>
    </div>
  );
}
