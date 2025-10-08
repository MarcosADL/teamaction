import { Suspense } from "react";
import CallbackClient from "./callback-client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">A processar autenticação…</div>}>
      <CallbackClient />
    </Suspense>
  );
}
