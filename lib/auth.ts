// lib/auth.ts — Supabase Auth nativo + tabela 'users' para o role

import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "./supabase-server";
import bcrypt from "bcryptjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(URL, SERVICE, { auth: { persistSession: false } });

export type Session = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null; // opcional, se quiseres permitir login por DB também
  role: "admin" | "user";
  created_at: string;
};

// Lê sessão atual (user do Supabase) + role na tabela users
export async function getSession(): Promise<Session | null> {
  const sb = supabaseServer();
  const { data: auth, error } = await sb.auth.getUser();
  if (error || !auth.user) return null;

  const email = auth.user.email?.toLowerCase() ?? "";
  if (!email) return null;

  // obter role da tabela users (ou 'user' por omissão)
  const { data: row } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role")
    .eq("email", email)
    .maybeSingle();

  return {
    id: auth.user.id,
    email,
    name: row?.name || auth.user.user_metadata?.name || email.split("@")[0],
    role: (row?.role as "admin" | "user") ?? "user",
  };
}

export async function requireAdmin(): Promise<Session> {
  const sess = await getSession();
  if (!sess || sess.role !== "admin") {
    throw new Error("Não autorizado.");
  }
  return sess;
}

/* ===== Registo / Login (opcionais) =====
   Se usares páginas próprias de login/registo:
   - Registo: cria user no Supabase Auth e uma linha na tabela 'users' com o role.
   - Login: usa supabase.auth.signInWithPassword no CLIENTE (página cliente).
*/

// criar conta no Supabase Auth + linha em 'users'
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}) {
  const role = input.role ?? "user";
  // 1) cria no Supabase Auth
  const { data: auth, error: e1 } = await supabaseAdmin.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name },
  });
  if (e1) throw new Error(e1.message);

  // 2) cria/atualiza a linha na tabela users
  const { error: e2 } = await supabaseAdmin.from("users").upsert({
    id: auth.user?.id,
    name: input.name,
    email: input.email.toLowerCase(),
    password_hash: null, // opcional
    role,
  });
  if (e2) throw new Error(e2.message);

  return { id: auth.user?.id!, email: input.email.toLowerCase(), role };
}

// (Opcional) login por DB (sem Supabase Auth), se algum fluxo precisar
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Admin helpers
export async function listUsers(): Promise<
  Array<Pick<UserRow, "id" | "name" | "email" | "role" | "created_at">>
> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function setUserRoleByEmail(params: {
  requesterId: string;
  requesterEmail: string;
  targetEmail: string;
  role: "admin" | "user";
}) {
  const { targetEmail, role } = params;
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ role })
    .eq("email", targetEmail.toLowerCase())
    .select("id,email,role")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Utilizador não encontrado.");
  return data;
}
