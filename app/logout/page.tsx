// app/logout/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export default async function LogoutPage() {
  const supabase = supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
