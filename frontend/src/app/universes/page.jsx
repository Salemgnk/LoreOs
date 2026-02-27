"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UniversesPage() {
  const { user, loading, getAccessToken, signOut } = useAuth();
  const router = useRouter();
  const [universes, setUniverses] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchUniverses = async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`${API}/universes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUniverses(await res.json());
        }
      } catch (e) {
        console.error("Erreur chargement univers:", e);
      } finally {
        setFetching(false);
      }
    };
    fetchUniverses();
  }, [user, getAccessToken]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lore-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            🌍 Mes <span className="text-lore-500">Univers</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {fetching ? (
        <p className="text-[var(--text-secondary)]">Chargement...</p>
      ) : universes.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] rounded-xl">
          <p className="text-6xl mb-4">🌌</p>
          <p className="text-xl mb-2">Aucun univers pour l'instant</p>
          <p className="text-[var(--text-secondary)] mb-6">
            Crée ton premier univers pour commencer le worldbuilding
          </p>
          {/* TODO: modal de création */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universes.map((u) => (
            <Link
              key={u.id}
              href={`/universe/${u.id}`}
              className="bg-[var(--bg-card)] rounded-xl p-6 hover:ring-1 hover:ring-lore-500/50 transition-all"
            >
              <h3 className="text-lg font-semibold mb-2">{u.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                {u.description || "Pas de description"}
              </p>
              <span className="inline-block mt-3 text-xs px-2 py-1 bg-lore-600/20 text-lore-400 rounded">
                {u.genre}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
