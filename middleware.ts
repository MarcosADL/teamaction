import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSupabaseSessionCookie(req: NextRequest) {
  const cookies = req.cookies.getAll().map((c) => c.name);
  return cookies.some(
    (name) =>
      name === "sb-access-token" ||
      name === "sb-refresh-token" ||
      /^sb-.*-auth-token$/.test(name)
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/backoffice")) {
    if (!hasSupabaseSessionCookie(req)) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
