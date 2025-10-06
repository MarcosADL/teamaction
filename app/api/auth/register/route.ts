// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import * as jose from "jose";
import bcrypt from "bcryptjs";

type User = {
  id: string | number;
  name: string;
  email: string;
  password_hash: string;
};

function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Dados em falta" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password muito curta (mín. 6)" },
        { status: 400 }
      );
    }

    // 1) ler base local
    const dbPath = process.cwd() + "/users.db.json";
    const raw = await readFile(dbPath, "utf8").catch(() => "[]");
    const users: User[] = JSON.parse(raw || "[]");

    // 2) verificar se já existe
    const exists = users.find((u) => sameEmail(u.email, email));
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Email já registado" },
        { status: 409 }
      );
    }

    // 3) criar utilizador
    const password_hash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: users.length > 0 ? Number(users[users.length - 1].id) + 1 : 1,
      name,
      email,
      password_hash,
    };
    users.push(newUser);

    // 4) gravar
    await writeFile(dbPath, JSON.stringify(users, null, 2), "utf8");

    // 5) criar sessão (cookie)
    const secret = new TextEncoder().encode(
      process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret"
    );
    const token = await new jose.SignJWT({
      sub: String(newUser.id),
      email: newUser.email,
      name: newUser.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const res = NextResponse.json({ ok: true });
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
      { ok: false, error: e?.message || "Erro no registo" },
      { status: 500 }
    );
  }
}
