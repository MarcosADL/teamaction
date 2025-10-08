// app/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = sanitizeNext(searchParams?.next);

  // Se já estiver autenticado, não mostra o form — redireciona de imediato
  const s = await getSession();
  if (s.authenticated) redirect(next);

  return <LoginForm nextPath={next} />;
}

function sanitizeNext(raw?: string) {
  if (!raw) return "/backoffice";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/backoffice";
  if (raw === "/login") return "/backoffice";
  return raw;
}
