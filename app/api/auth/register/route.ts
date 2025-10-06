import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: lógica de registo aqui
    return NextResponse.json({ ok: true, body }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 400 });
  }
}
