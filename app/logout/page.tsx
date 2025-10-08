// app/logout/page.tsx
import { redirect } from "next/navigation";
import { supabaseForActions } from "@/lib/supabase-actions";

export const runtime = "nodejs";

export default async function LogoutPage() {
  const supabase = supabaseForActions();
  await supabase.auth.signOut();
  redirect("/login");
}
