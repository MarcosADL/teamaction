import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Preenche email e password." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });

    await createSession(user);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro no login." }, { status: 400 });
  }
}
