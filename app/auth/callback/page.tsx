// app/auth/callback/page.tsx
import { Suspense } from "react";
import AuthCallbackClient from "./callback-client";

export const dynamic = "force-dynamic"; // evita prerender desta rota

export default function Page() {
  return (
    <main className="p-6 text-center">
      <Suspense fallback={<p>A confirmar sessão…</p>}>
        <AuthCallbackClient />
      </Suspense>
    </main>
  );
}
