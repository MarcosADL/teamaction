// components/LogoutButton.tsx
"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await supabase.auth.signOut(); router.push("/login"); })}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      {pending ? "A sair…" : "Sair"}
    </button>
  );
}
