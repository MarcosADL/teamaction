// app/auth/signin/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Só para debug do fluxo — ignora credenciais e responde ok
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro" }, { status: 500 });
  }
}
