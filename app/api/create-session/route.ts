import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const COOKIE = "session";
const SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret"
);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, msg: "Use POST" }, { status: 405 });
}

export async function POST(req: Request) {
  const { role = "admin" } = await req.json().catch(() => ({}));
  const jwt = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, jwt, {
    httpOnly: true, secure: true, sameSite: "lax",
    path: "/", maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
