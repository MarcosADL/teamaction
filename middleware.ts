import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "session";
const SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteger rotas do Backoffice (apenas admins)
  if (pathname.startsWith("/backoffice")) {
    const token = req.cookies.get(COOKIE)?.value;

    // Se não houver sessão → mandar para /login?next=<path>
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Validar token e role
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.role !== "admin") {
        // Tem sessão mas não é admin → homepage (ou outra página pública)
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      // Token inválido/expirado → forçar login
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // default allow
  return NextResponse.next();
}

// Define quais caminhos passam pelo middleware
export const config = {
  matcher: ["/backoffice/:path*"],
};
