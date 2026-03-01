"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/universes");
    }
  }, [loading, user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="font-heading text-5xl font-bold tracking-wide mb-4">
          ⚙️ Lore<span className="text-[var(--accent)]">OS</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          Le système d&apos;exploitation de l&apos;écrivain.
          <br />
          Worldbuilding, personnages, relations, cultures et histoire
          dans une seule app.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="btn-primary !px-6 !py-3 !rounded-lg"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="btn-ghost !px-6 !py-3 !rounded-lg"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
