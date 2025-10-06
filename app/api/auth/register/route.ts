// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function env(name: string) {
  return (process.env[name]?.trim() ?? "");
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "register" });
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL");
    const SUPABASE_ANON = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json(
        { error: "Supabase não configurado (URL/ANON KEY)." },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    const u = new URL(req.url);
    const baseUrl = env("NEXT_PUBLIC_SITE_URL") || `${u.protocol}//${u.host}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (error) {
      const msg = /already/i.test(error.message)
        ? "Email já registado."
        : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro interno no registo." },
      { status: 500 }
    );
  }
}
