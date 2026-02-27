"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Page de callback OAuth — Supabase redirige ici après Google sign-in.
 * Le hash fragment contient le token, le client Supabase le parse automatiquement.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange dans le AuthProvider va capter la session
    // On attend juste que la session soit établie puis on redirige
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/universes");
      } else {
        // Attendre un peu (le hash parsing peut prendre un tick)
        setTimeout(async () => {
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          router.replace(s ? "/universes" : "/login");
        }, 1000);
      }
    };
    checkSession();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lore-500 mx-auto mb-4"></div>
        <p className="text-[var(--text-secondary)]">Connexion en cours...</p>
      </div>
    </main>
  );
}
