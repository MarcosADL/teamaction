import { NextResponse } from "next/server";

type RegisterBody = {
  email: string;
  password: string;
  name?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<RegisterBody>;

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "email e password são obrigatórios" }, { status: 400 });
    }

    // TODO: lógica real de registo (ex.: supabase.auth.signUp)
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro inesperado";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
