// app/register/page.tsx
import { Suspense } from "react";
import RegisterClient from "./register-client";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregar…</div>}>
      <RegisterClient />
    </Suspense>
  );
}
