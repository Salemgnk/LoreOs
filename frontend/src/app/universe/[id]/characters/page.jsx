"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { characters as charsApi } from "@/lib/api";

const EMPTY_FORM = { name: "", title: "", description: "", traits: [], location: "", backstory: "", notes: "" };

export default function CharactersPage() {
  const { id: universeId } = useParams();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [traitInput, setTraitInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null); // fiche détail

  const fetchCharacters = async () => {
    try {
      const data = await charsApi.list(universeId);
      setCharacters(data);
    } catch (e) {
      console.error("Erreur:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharacters(); }, [universeId]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setTraitInput("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (char) => {
    setEditing(char);
    setForm({
      name: char.name || "",
      title: char.title || "",
      description: char.description || "",
      traits: char.traits || [],
      location: char.location || "",
      backstory: char.backstory || "",
      notes: char.notes || "",
    });
    setTraitInput("");
    setError("");
    setShowModal(true);
  };

  const addTrait = () => {
    if (traitInput.trim() && !form.traits.includes(traitInput.trim())) {
      setForm({ ...form, traits: [...form.traits, traitInput.trim()] });
      setTraitInput("");
    }
  };

  const removeTrait = (t) => setForm({ ...form, traits: form.traits.filter((x) => x !== t) });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Le nom est obligatoire");
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await charsApi.update(universeId, editing.id, form);
      } else {
        await charsApi.create(universeId, form);
      }
      setShowModal(false);
      setSelected(null);
      await fetchCharacters();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (charId, name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      await charsApi.delete(universeId, charId);
      if (selected?.id === charId) setSelected(null);
      await fetchCharacters();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lore-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">👥 Personnages</h1>
          <p className="text-[var(--text-secondary)]">
            {characters.length} personnage{characters.length !== 1 ? "s" : ""} dans cet univers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
        >
          + Nouveau personnage
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-white/5 text-center text-[var(--text-secondary)]">
          <p className="text-4xl mb-4">👥</p>
          <p>Aucun personnage pour l'instant.</p>
          <p className="text-sm mt-2">Crée ton premier personnage pour commencer.</p>
          <button
            onClick={openCreate}
            className="mt-4 px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            🎭 Créer un personnage
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Liste */}
          <div className="w-full lg:w-1/2 space-y-3">
            {characters.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`bg-[var(--bg-card)] rounded-xl p-4 border cursor-pointer transition-all group ${
                  selected?.id === c.id ? "border-lore-500/50 ring-1 ring-lore-500/20" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    {c.title && <p className="text-sm text-lore-400">{c.title}</p>}
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {c.description || "Pas de description"}
                    </p>
                    {c.traits?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.traits.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-white/5 rounded-full">{t}</span>
                        ))}
                        {c.traits.length > 4 && (
                          <span className="text-xs text-[var(--text-secondary)]">+{c.traits.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-sm hover:text-lore-400" title="Modifier">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); }} className="text-sm hover:text-red-400" title="Supprimer">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fiche détail */}
          {selected && (
            <div className="hidden lg:block w-1/2 bg-[var(--bg-card)] rounded-xl p-6 border border-white/5 sticky top-8 self-start max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  {selected.title && <p className="text-lore-400">{selected.title}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="text-[var(--text-secondary)] hover:text-white">✕</button>
              </div>
              {selected.location && (
                <p className="text-sm mb-3"><span className="text-[var(--text-secondary)]">📍 Lieu :</span> {selected.location}</p>
              )}
              {selected.traits?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Traits :</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.traits.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 bg-lore-600/20 text-lore-400 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.description && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Description :</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}
              {selected.backstory && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Backstory :</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.backstory}</p>
                </div>
              )}
              {selected.notes && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Notes :</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button onClick={() => openEdit(selected)} className="flex-1 px-3 py-2 bg-lore-600/20 text-lore-400 hover:bg-lore-600/30 rounded-lg text-sm transition-colors">
                  ✏️ Modifier
                </button>
                <button onClick={() => handleDelete(selected.id, selected.name)} className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal création/édition ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editing ? `✏️ Modifier ${editing.name}` : "🎭 Nouveau personnage"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aragorn" className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" autoFocus />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Titre</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Roi du Gondor" className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Lieu</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Minas Tirith" className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Un rôdeur au passé mystérieux..." rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Backstory</label>
                <textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                  placeholder="Né héritier du trône, il a grandi en exil..." rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Traits de personnalité</label>
                <div className="flex gap-2">
                  <input value={traitInput} onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrait(); } }}
                    placeholder="Courageux, Loyal..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none text-sm" />
                  <button type="button" onClick={addTrait} className="px-3 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10">+</button>
                </div>
                {form.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.traits.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 bg-lore-600/20 text-lore-400 rounded-full flex items-center gap-1">
                        {t}
                        <button type="button" onClick={() => removeTrait(t)} className="hover:text-red-400">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes libres..." rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? "Sauvegarde..." : editing ? "Sauvegarder" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
