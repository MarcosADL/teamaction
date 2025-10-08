import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Alguns SDKs do Supabase colocam cookies com nomes ligeiramente diferentes.
// Regra segura: aceitar "sb-access-token" ou qualquer cookie que pareça ser de auth do Supabase.
function hasSupabaseSessionCookie(req: NextRequest) {
  const cookies = req.cookies.getAll()?.map(c => c.name) || [];
  return cookies.some((name) =>
    name === "sb-access-token" ||
    name === "sb-refresh-token" ||
    /^sb-.*-auth-token$/.test(name) // variantes antigas
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/backoffice")) {
    // Se não tiver sessão do Supabase → redireciona para login
    if (!hasSupabaseSessionCookie(req)) {
      const url = new URL("/login", req.url);
      // preserva o destino para voltar depois do login
      url.searchParams.set("next", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
    // Se tiver sessão, deixamos passar: o role "admin" será verificado no server (requireAdmin()).
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
