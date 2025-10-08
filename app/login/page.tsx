import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SP = { next?: string };

export default async function LoginPage({
  searchParams,
}: { searchParams?: SP | Promise<SP> }) {
  const sp = (await searchParams) || {};
  const next = sanitizeNext(sp.next);

  try {
    const s = await getSession();
    if (s.authenticated) redirect(next);
  } catch {}
  return <LoginForm nextPath={next} />;
}

function sanitizeNext(raw?: string) {
  if (!raw) return "/backoffice";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/backoffice";
  if (raw === "/login") return "/backoffice";
  return raw;
}
