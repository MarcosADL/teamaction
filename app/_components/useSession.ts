"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!ignore) setUser(data.session?.user ?? null);
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) setUser(session?.user ?? null);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, user };
}
