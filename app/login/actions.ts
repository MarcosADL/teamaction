// app/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseForActions } from "@/lib/supabase-actions";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/backoffice");

  const supabase = supabaseForActions();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Devolve erro para a UI sem rebentar
    return { ok: false, message: error.message };
  }

  // Cookies já foram escritos pelo server → podes redirecionar
  redirect(next);
}
