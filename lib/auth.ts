// lib/auth.ts
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

export type AppRole = "user" | "admin";

/** Permite marcar admins por ENV: ADMIN_EMAILS=mail1@mail.com,mail2@mail.com */
function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return email ? list.includes(email.toLowerCase()) : false;
}

export async function getCurrentUser() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function getSession() {
  const user = await getCurrentUser();

  const roleMeta =
    (user?.app_metadata?.role as AppRole | undefined) ??
    (user?.user_metadata?.role as AppRole | undefined) ??
    "user";

  // Se o email estiver na ENV, força admin (útil em prod para não entrares em loop)
  const role: AppRole = isAdminEmail(user?.email) ? "admin" : roleMeta;

  return {
    authenticated: !!user,
    email: user?.email ?? null,
    role,
  };
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s.authenticated) redirect("/login?e=auth&next=/backoffice");
  if (s.role !== "admin") redirect("/login?e=restricted&next=/backoffice");
  return s;
}

export async function listUsers() {
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  return (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role:
      ((u.app_metadata as any)?.role as AppRole | undefined) ??
      ((u.user_metadata as any)?.role as AppRole | undefined) ??
      "user",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));
}

export async function setUserRoleByEmail(email: string, role: AppRole) {
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  const user = (data?.users ?? []).find(
    (u) => (u.email ?? "").toLowerCase() === email.toLowerCase()
  );
  if (!user) throw new Error("Utilizador não encontrado");

  const resp = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role },
    user_metadata: { ...(user.user_metadata || {}), role },
  });
  if (resp.error) throw resp.error;
  return resp.data;
}
