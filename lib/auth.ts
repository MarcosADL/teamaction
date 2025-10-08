// lib/auth.ts
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

export type AppRole = "user" | "admin";

export async function getCurrentUser() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?e=auth");
  const role =
    (user.app_metadata?.role as AppRole | undefined) ??
    (user.user_metadata?.role as AppRole | undefined) ??
    "user";
  if (role !== "admin") redirect("/login?e=restricted");
  return user;
}

export async function listUsers() {
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
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
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const user = (data?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Utilizador não encontrado");

  const resp = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role },
    // (opcional) replica também em user_metadata:
    user_metadata: { ...(user.user_metadata || {}), role },
  });
  if (resp.error) throw resp.error;
  return resp.data;
}
// lib/auth.ts (acrescento)
export async function getSession() {
  const user = await getCurrentUser();
  const role =
    (user?.app_metadata?.role as AppRole | undefined) ??
    (user?.user_metadata?.role as AppRole | undefined) ??
    "user";

  return {
    authenticated: !!user,
    email: user?.email ?? null,
    role,
  };
}

