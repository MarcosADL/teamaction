// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST() {
  try {
    // Cria instância do Supabase (sem sessão persistente no servidor)
    const supabase = createClient(URL, ANON, { auth: { persistSession: false } });

    // Termina sessão no Supabase
    await supabase.auth.signOut();

    // (Opcional) Se quiseres limpar cookies da app, poderias fazê-lo aqui

    return NextResponse.json({ ok: true, message: "Sessão terminada com sucesso." });
  } catch (e: any) {
    console.error("Erro ao terminar sessão:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Erro ao terminar sessão." },
      { status: 500 }
    );
  }
}
