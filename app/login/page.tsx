// app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic"; // evita SSG da página de login

export default function Page({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const nextParam = (searchParams?.next ?? "/backoffice") as string;

  return (
    <Suspense fallback={<div className="p-6">A carregar…</div>}>
      <LoginClient nextParam={nextParam} />
    </Suspense>
  );
}
