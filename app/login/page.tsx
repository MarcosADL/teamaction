// app/login/page.tsx
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SP = { next?: string };

export default async function LoginPage({
  searchParams,
}: { searchParams?: SP | Promise<SP> }) {
  // searchParams pode ser Promise em prod
  let sp: SP = {};
  try {
    sp = ((await searchParams) || {}) as SP;
  } catch {}

  const next = sanitizeNext(sp.next);
  // ⚠️ Sem getSession no server — deixa o client redirecionar se já estiver logado
  return <LoginForm nextPath={next} />;
}

function sanitizeNext(raw?: string) {
  if (!raw) return "/backoffice";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/backoffice";
  if (raw === "/login") return "/backoffice";
  return raw;
}
