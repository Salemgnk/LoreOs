"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { universes as universesApi } from "@/lib/api";

const GENRE_SUGGESTIONS = [
  "Fantasy", "Dark Fantasy", "Science-Fiction", "Space Opera", "Steampunk",
  "Cyberpunk", "Post-Apocalyptique", "Urban Fantasy", "Horreur", "Thriller",
  "Romance", "Dark Romance", "Érotique", "Historique", "Contemporain",
  "Dystopie", "Mythologie", "Xianxia", "LitRPG", "Grimdark",
];

export default function UniversesPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [universes, setUniverses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", genres: [] });
  const [genreInput, setGenreInput] = useState("");
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

  useEffect(() => { if (user) fetchUniverses(); }, [user]);

  // Genre helpers
  const addGenre = (g) => {
    const genre = g.trim();
    if (genre && !form.genres.includes(genre)) {
      setForm({ ...form, genres: [...form.genres, genre] });
    }
    setGenreInput("");
  };
  const removeGenre = (g) => setForm({ ...form, genres: form.genres.filter((x) => x !== g) });
  const filteredSuggestions = GENRE_SUGGESTIONS.filter(
    (g) => !form.genres.includes(g) && g.toLowerCase().includes(genreInput.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Le nom est obligatoire");
    setCreating(true);
    setError("");
    try {
      await universesApi.create({
        name: form.name,
        description: form.description,
        genre: form.genres.join(", ") || "fantasy",
      });
      setShowModal(false);
      setForm({ name: "", description: "", genres: [] });
      setGenreInput("");
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

  const parseGenres = (genre) => genre ? genre.split(",").map((g) => g.trim()).filter(Boolean) : [];

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-lore-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen page-enter">
      <header className="sticky top-0 z-30 glass px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">Lore<span className="text-lore-400">OS</span></span>
            <span className="text-[var(--text-secondary)] text-sm hidden sm:block">/ Mes Univers</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-secondary)] hidden sm:block">{user.email}</span>
            <button onClick={signOut} className="btn-ghost text-xs !px-3 !py-1.5">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mes Univers</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {universes.length} univers créé{universes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Nouvel univers</button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lore-500 border-t-transparent" />
          </div>
        ) : universes.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-lore-600/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌌</span>
            </div>
            <p className="text-lg font-medium mb-1">Aucun univers</p>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              Crée ton premier univers pour commencer à construire ton lore.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">Créer mon premier univers</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {universes.map((u) => (
              <div key={u.id} className="card group relative overflow-hidden">
                <Link href={`/universe/${u.id}`} className="block p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-base leading-tight">{u.name}</h3>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(u.id, u.name); }}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 text-xs transition-all -mt-0.5"
                      title="Supprimer"
                    >✕</button>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
                    {u.description || "Pas de description"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parseGenres(u.genre).map((g) => (
                      <span key={g} className="chip text-[11px]">{g}</span>
                    ))}
                  </div>
                </Link>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-lore-500 to-lore-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-5">Nouvel univers</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Nom *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Les Terres Brisées" className="input" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Un monde sombre où les continents flottent..." rows={3} className="input resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Genres</label>
                {form.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.genres.map((g) => (
                      <span key={g} className="chip chip-active">
                        {g}
                        <button type="button" onClick={() => removeGenre(g)} className="hover:text-red-300 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input value={genreInput} onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addGenre(genreInput); }
                      if (e.key === "Backspace" && !genreInput && form.genres.length) removeGenre(form.genres[form.genres.length - 1]);
                    }}
                    placeholder={form.genres.length ? "Ajouter un genre..." : "Fantasy, Dark Romance, Sci-Fi..."}
                    className="input !py-2" />
                  {genreInput && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] shadow-xl max-h-40 overflow-y-auto">
                      {filteredSuggestions.slice(0, 8).map((g) => (
                        <button key={g} type="button" onClick={() => addGenre(g)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.genres.length === 0 && !genreInput && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Fantasy", "Dark Romance", "Science-Fiction", "Horreur", "Steampunk"].map((g) => (
                      <button key={g} type="button" onClick={() => addGenre(g)} className="chip text-[11px] hover:bg-white/8">+ {g}</button>
                    ))}
                  </div>
                )}
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setError(""); setGenreInput(""); }} className="btn-ghost flex-1">Annuler</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 disabled:opacity-50">
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
