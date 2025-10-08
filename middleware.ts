// middleware.ts (raiz)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Só protege o backoffice
  if (!req.nextUrl.pathname.startsWith("/backoffice")) return res;

  try {
    const supabase = createMiddlewareClient({ req, res });

    // Obtém/atualiza sessão a partir dos cookies
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const url = new URL("/login", req.url); // ajusta se o teu login for /auth/signin
      url.searchParams.set(
        "next",
        req.nextUrl.pathname + (req.nextUrl.search || "")
      );
      return NextResponse.redirect(url);
    }

    return res; // sessão válida → segue
  } catch {
    // Em caso de erro inesperado, redireciona para login (evita página branca)
    const url = new URL("/login", req.url);
    url.searchParams.set(
      "next",
      req.nextUrl.pathname + (req.nextUrl.search || "")
    );
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
