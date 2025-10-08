import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

export type Session = { id: string; email: string; name: string; role: "admin" | "user" };

async function serverSb() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: { get(name) { return store.get(name)?.value; } },
  });
}

export async function getSession(): Promise<Session | null> {
  const sb = await serverSb();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user?.email) return null;

  const { data: row } = await admin
    .from("users")
    .select("id,name,email,role")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  return {
    id: user.id,
    email: user.email.toLowerCase(),
    name: row?.name || (user.user_metadata as any)?.name || user.email.split("@")[0],
    role: (row?.role as "admin" | "user") ?? "user",
  };
}
