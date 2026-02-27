"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { universes as universesApi } from "@/lib/api";

export default function UniversesPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [universes, setUniverses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", genre: "fantasy" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const fetchUniverses = async () => {
    try {
      const data = await universesApi.list();
      setUniverses(data);
    } catch (e) {
      console.error("Erreur chargement univers:", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchUniverses();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Le nom est obligatoire");
    setCreating(true);
    setError("");
    try {
      await universesApi.create(form);
      setShowModal(false);
      setForm({ name: "", description: "", genre: "fantasy" });
      await fetchUniverses();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer l'univers "${name}" ? Cette action est irréversible.`)) return;
    try {
      await universesApi.delete(id);
      await fetchUniverses();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lore-500" />
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            + Nouvel univers
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            Déconnexion
          </button>
        </div>
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
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            🚀 Créer mon premier univers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {universes.map((u) => (
            <div key={u.id} className="bg-[var(--bg-card)] rounded-xl p-6 hover:ring-1 hover:ring-lore-500/50 transition-all group relative">
              <Link href={`/universe/${u.id}`} className="block">
                <h3 className="text-lg font-semibold mb-2">{u.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {u.description || "Pas de description"}
                </p>
                <span className="inline-block mt-3 text-xs px-2 py-1 bg-lore-600/20 text-lore-400 rounded">
                  {u.genre}
                </span>
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(u.id, u.name); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-opacity"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal création univers ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">🌌 Nouvel univers</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Les Terres Brisées"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Un monde sombre où les continents flottent..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Genre</label>
                <select
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none"
                >
                  {["fantasy", "dark fantasy", "science-fiction", "steampunk", "post-apocalyptique", "urban fantasy", "space opera", "horreur", "autre"].map((g) => (
                    <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); }}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
