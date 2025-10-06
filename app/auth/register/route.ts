import { NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: "Preenche nome, email e password." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Email inválido." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "Password curta (mín. 6)." }, { status: 400 });
    }

    const user = await createUser({ name, email, password, role: "user" });
    // inicia sessão automaticamente
    await createSession({ ...user, passwordHash: "" } as any);

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: "user" } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro no registo." }, { status: 400 });
  }
}
