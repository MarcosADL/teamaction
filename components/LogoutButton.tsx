"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try { await supabase.auth.signOut(); router.replace("/login"); router.refresh(); }
        finally { setLoading(false); }
      }}
      disabled={loading}
      className="border px-3 py-1.5 rounded-md text-sm hover:bg-muted/40"
    >
      {loading ? "A sair…" : "Sair"}
    </button>
  );
}
