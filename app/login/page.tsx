// app/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LoginPage({
  searchParams,
}: { searchParams?: { next?: string } }) {
  const next = sanitizeNext(searchParams?.next);

  const s = await getSession();            // NÃO deve lançar
  if (s.authenticated) redirect(next);     // já logado? segue

  return <LoginForm nextPath={next} />;
}

function sanitizeNext(raw?: string) {
  if (!raw) return "/backoffice";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/backoffice";
  if (raw === "/login") return "/backoffice";
  return raw;
}
