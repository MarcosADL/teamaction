// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // evitar edge p/ libs nativas

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // ANON para signUp
  if (!url || !key) throw new Error('Supabase não configurado');
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const supabase = getSupabase();

    // cria utilizador com e-mail de confirmação
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase().includes('already') ? 'Email já registado.' : error.message;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
  } catch (err: any) {
    const message = err?.message || 'Erro inesperado no registo.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
