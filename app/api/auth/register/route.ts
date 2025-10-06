import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missing = [
      !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
    ].filter(Boolean);

    if (missing.length) {
      return NextResponse.json(
        { error: `Env(s) em falta: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Campos em falta." }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, user: data.user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
