// app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import * as jose from "jose";
import bcrypt from "bcryptjs";

type User = {
  id: string | number;
  name: string;
  email: string;
  // pode existir um destes dois campos dependendo de como gravaste no register
  password?: string;
  password_hash?: string;
};

function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Credenciais em falta" }, { status: 400 });
    }

    // 1) ler "base de dados" local
    const raw = await readFile(process.cwd() + "/users.db.json", "utf8").catch(() => "[]");
    const users: User[] = JSON.parse(raw || "[]");

    // 2) procurar utilizador por email
    const user = users.find((u) => sameEmail(u.email, email));
    if (!user) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas" }, { status: 401 });
    }

    // 3) validar password (hash ou texto simples)
    let valid = false;
    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    } else if (user.password) {
      valid = user.password === password;
    }

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Credenciais inválidas" }, { status: 401 });
    }

    // 4) assinar cookie de sessão (JWT)
    const secret = new TextEncoder().encode(process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret");
    const token = await new jose.SignJWT({
      sub: String(user.id),
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const res = NextResponse.json({ ok: true });

    // cookie httpOnly
    res.cookies.set("app_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erro no login" },
      { status: 500 }
    );
  }
}
