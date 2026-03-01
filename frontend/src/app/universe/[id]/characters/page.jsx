"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { characters as charsApi } from "@/lib/api";

const EMPTY_FORM = { name: "", title: "", description: "", traits: [], location: "", backstory: "", notes: "" };

// ── Catégories de relations (couvre TOUS les genres littéraires) ──
const RELATION_CATEGORIES = [
  {
    label: "Liens sociaux",
    types: [
      { value: "ally", label: "Allié", icon: "🤝", color: "text-green-400 bg-green-500/15" },
      { value: "enemy", label: "Ennemi", icon: "⚔️", color: "text-red-400 bg-red-500/15" },
      { value: "rival", label: "Rival", icon: "🔥", color: "text-orange-400 bg-orange-500/15" },
      { value: "friend", label: "Ami·e", icon: "😊", color: "text-cyan-400 bg-cyan-500/15" },
      { value: "betrayer", label: "Traître", icon: "🗡️", color: "text-rose-400 bg-rose-500/15" },
      { value: "protector", label: "Protecteur", icon: "🛡️", color: "text-sky-400 bg-sky-500/15" },
    ],
  },
  {
    label: "Famille & Sang",
    types: [
      { value: "family", label: "Famille", icon: "👨‍👩‍👧", color: "text-blue-400 bg-blue-500/15" },
      { value: "parent", label: "Parent", icon: "👤", color: "text-blue-300 bg-blue-400/15" },
      { value: "child", label: "Enfant", icon: "👶", color: "text-blue-200 bg-blue-300/15" },
      { value: "sibling", label: "Frère/Sœur", icon: "👫", color: "text-indigo-400 bg-indigo-500/15" },
      { value: "twin", label: "Jumeau·elle", icon: "♊", color: "text-indigo-300 bg-indigo-400/15" },
      { value: "ancestor", label: "Ancêtre", icon: "🏛️", color: "text-stone-400 bg-stone-500/15" },
    ],
  },
  {
    label: "Pouvoir & Hiérarchie",
    types: [
      { value: "mentor", label: "Mentor", icon: "🎓", color: "text-purple-400 bg-purple-500/15" },
      { value: "apprentice", label: "Apprenti·e", icon: "📚", color: "text-purple-300 bg-purple-400/15" },
      { value: "master", label: "Maître", icon: "👑", color: "text-yellow-400 bg-yellow-500/15" },
      { value: "servant", label: "Serviteur", icon: "🙇", color: "text-gray-400 bg-gray-500/15" },
      { value: "vassal", label: "Vassal", icon: "⚜️", color: "text-amber-400 bg-amber-500/15" },
      { value: "captor", label: "Geôlier", icon: "🔒", color: "text-zinc-400 bg-zinc-500/15" },
      { value: "prisoner", label: "Prisonnier·e", icon: "⛓️", color: "text-zinc-300 bg-zinc-400/15" },
    ],
  },
  {
    label: "Romance & Désir",
    types: [
      { value: "lover", label: "Amant·e", icon: "❤️", color: "text-pink-400 bg-pink-500/15" },
      { value: "ex", label: "Ex", icon: "💔", color: "text-pink-300 bg-pink-400/15" },
      { value: "crush", label: "Crush", icon: "💘", color: "text-rose-300 bg-rose-400/15" },
      { value: "spouse", label: "Époux·se", icon: "💍", color: "text-pink-200 bg-pink-300/15" },
      { value: "forbidden", label: "Interdit", icon: "🚫❤️", color: "text-red-300 bg-red-400/15" },
      { value: "obsession", label: "Obsession", icon: "🖤", color: "text-fuchsia-400 bg-fuchsia-500/15" },
      { value: "soulmate", label: "Âme sœur", icon: "✨", color: "text-violet-400 bg-violet-500/15" },
      { value: "dominant", label: "Dominant·e", icon: "🔱", color: "text-red-500 bg-red-600/15" },
      { value: "submissive", label: "Soumis·e", icon: "🌹", color: "text-red-200 bg-red-300/15" },
      { value: "seducer", label: "Séducteur·rice", icon: "💋", color: "text-fuchsia-300 bg-fuchsia-400/15" },
    ],
  },
  {
    label: "Surnaturel & Fantasy",
    types: [
      { value: "bonded", label: "Lié·e magique", icon: "🔮", color: "text-violet-400 bg-violet-500/15" },
      { value: "summoner", label: "Invocateur", icon: "🌀", color: "text-teal-400 bg-teal-500/15" },
      { value: "familiar", label: "Familier", icon: "🐾", color: "text-emerald-400 bg-emerald-500/15" },
      { value: "creator", label: "Créateur·rice", icon: "⚡", color: "text-yellow-300 bg-yellow-400/15" },
      { value: "creation", label: "Création", icon: "🤖", color: "text-cyan-300 bg-cyan-400/15" },
      { value: "host", label: "Hôte", icon: "🧬", color: "text-lime-400 bg-lime-500/15" },
      { value: "parasite", label: "Parasite", icon: "🦠", color: "text-green-300 bg-green-400/15" },
      { value: "deity", label: "Divinité", icon: "☀️", color: "text-amber-300 bg-amber-400/15" },
      { value: "worshipper", label: "Adorateur·rice", icon: "🙏", color: "text-amber-200 bg-amber-300/15" },
    ],
  },
  {
    label: "Conflit & Sombre",
    types: [
      { value: "nemesis", label: "Némésis", icon: "💀", color: "text-red-500 bg-red-600/15" },
      { value: "manipulator", label: "Manipulateur", icon: "🎭", color: "text-amber-400 bg-amber-500/15" },
      { value: "victim", label: "Victime", icon: "😢", color: "text-slate-400 bg-slate-500/15" },
      { value: "accomplice", label: "Complice", icon: "🤫", color: "text-neutral-400 bg-neutral-500/15" },
      { value: "hunter", label: "Chasseur", icon: "🏹", color: "text-orange-500 bg-orange-600/15" },
      { value: "prey", label: "Proie", icon: "🎯", color: "text-orange-300 bg-orange-400/15" },
      { value: "torturer", label: "Bourreau", icon: "⚰️", color: "text-gray-500 bg-gray-600/15" },
    ],
  },
];

// Flat list pour lookup rapide
const RELATION_TYPES = RELATION_CATEGORIES.flatMap((c) => c.types);

const getRelationType = (type) => RELATION_TYPES.find((r) => r.value === type) || { value: type, label: type, icon: "🔗", color: "text-white/60 bg-white/5" };

export default function CharactersPage() {
  const { id: universeId } = useParams();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [traitInput, setTraitInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  // Relations state
  const [relations, setRelations] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [showRelationModal, setShowRelationModal] = useState(false);
  const [relationForm, setRelationForm] = useState({ target_id: "", relation_type: "ally", description: "" });
  const [relationError, setRelationError] = useState("");
  const [savingRelation, setSavingRelation] = useState(false);

  // Character name lookup
  const charMap = useMemo(() => {
    const map = {};
    characters.forEach((c) => { map[c.id] = c; });
    return map;
  }, [characters]);

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

  const fetchRelations = async (charId) => {
    setLoadingRelations(true);
    try {
      const data = await charsApi.getRelations(universeId, charId);
      setRelations(data);
    } catch (e) {
      console.error("Erreur relations:", e);
      setRelations([]);
    } finally {
      setLoadingRelations(false);
    }
  };

  useEffect(() => { fetchCharacters(); }, [universeId]);

  // Quand on sélectionne un personnage, charger ses relations
  const selectCharacter = async (char) => {
    setSelected(char);
    await fetchRelations(char.id);
  };

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
      setRelations([]);
      await fetchCharacters();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (charId, name) => {
    if (!confirm(`Supprimer "${name}" ? Toutes ses relations seront aussi supprimées.`)) return;
    try {
      await charsApi.delete(universeId, charId);
      if (selected?.id === charId) { setSelected(null); setRelations([]); }
      await fetchCharacters();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  // ── Relations handlers ──
  const openAddRelation = () => {
    setRelationForm({ target_id: "", relation_type: "ally", description: "" });
    setRelationError("");
    setShowRelationModal(true);
  };

  const handleAddRelation = async (e) => {
    e.preventDefault();
    if (!relationForm.target_id) return setRelationError("Choisis un personnage cible");
    if (relationForm.target_id === selected.id) return setRelationError("Un personnage ne peut pas avoir une relation avec lui-même");
    setSavingRelation(true);
    setRelationError("");
    try {
      await charsApi.addRelation(universeId, selected.id, {
        source_id: selected.id,
        target_id: relationForm.target_id,
        relation_type: relationForm.relation_type,
        description: relationForm.description,
      });
      setShowRelationModal(false);
      await fetchRelations(selected.id);
    } catch (e) {
      setRelationError(e.message);
    } finally {
      setSavingRelation(false);
    }
  };

  const handleDeleteRelation = async (relationId) => {
    if (!confirm("Supprimer cette relation ?")) return;
    try {
      await charsApi.deleteRelation(universeId, selected.id, relationId);
      await fetchRelations(selected.id);
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  // Personnages disponibles pour les relations (exclure le sélectionné)
  const availableTargets = useMemo(
    () => characters.filter((c) => c.id !== selected?.id),
    [characters, selected]
  );

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
        <div className="flex gap-3">
          <Link
            href={`/universe/${universeId}/characters/graph`}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors border border-white/10 text-sm flex items-center gap-2"
          >
            🕸️ Graphe
          </Link>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            + Nouveau personnage
          </button>
        </div>
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
          {/* ── Liste personnages ── */}
          <div className="w-full lg:w-2/5 space-y-3">
            {characters.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCharacter(c)}
                className={`bg-[var(--bg-card)] rounded-xl p-4 border cursor-pointer transition-all group ${
                  selected?.id === c.id ? "border-lore-500/50 ring-1 ring-lore-500/20" : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    {c.title && <p className="text-sm text-lore-400">{c.title}</p>}
                    {c.location && <p className="text-xs text-[var(--text-secondary)] mt-0.5">📍 {c.location}</p>}
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {c.description || "Pas de description"}
                    </p>
                    {c.traits?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.traits.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-white/5 rounded-full">{t}</span>
                        ))}
                        {c.traits.length > 3 && (
                          <span className="text-xs text-[var(--text-secondary)]">+{c.traits.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-sm hover:text-lore-400" title="Modifier">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); }} className="text-sm hover:text-red-400" title="Supprimer">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Fiche détail + Relations ── */}
          {selected && (
            <div className="hidden lg:block w-3/5 bg-[var(--bg-card)] rounded-xl p-6 border border-white/5 sticky top-8 self-start max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  {selected.title && <p className="text-lore-400 text-sm">{selected.title}</p>}
                </div>
                <button onClick={() => { setSelected(null); setRelations([]); }} className="text-[var(--text-secondary)] hover:text-white text-lg">✕</button>
              </div>

              {/* Info */}
              {selected.location && (
                <p className="text-sm mb-3"><span className="text-[var(--text-secondary)]">📍 Lieu :</span> {selected.location}</p>
              )}

              {selected.traits?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Traits</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.traits.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 bg-lore-600/20 text-lore-400 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.description && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.description}</p>
                </div>
              )}

              {selected.backstory && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Backstory</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.backstory}</p>
                </div>
              )}

              {selected.notes && (
                <div className="mb-4">
                  <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Notes</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* ── Relations ── */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                    Relations ({relations.length})
                  </p>
                  {availableTargets.length > 0 && (
                    <button onClick={openAddRelation}
                      className="text-xs px-3 py-1.5 bg-lore-600/20 text-lore-400 hover:bg-lore-600/30 rounded-lg transition-colors">
                      + Ajouter
                    </button>
                  )}
                </div>

                {loadingRelations ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-lore-500" />
                  </div>
                ) : relations.length === 0 ? (
                  <div className="text-center py-6 text-[var(--text-secondary)]">
                    <p className="text-2xl mb-1">🔗</p>
                    <p className="text-sm">Aucune relation.</p>
                    {availableTargets.length > 0 && (
                      <button onClick={openAddRelation}
                        className="mt-2 text-xs text-lore-400 hover:text-lore-300 transition-colors">
                        Ajouter une relation →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relations.map((rel) => {
                      const rt = getRelationType(rel.relation_type);
                      const isSource = rel.source_id === selected.id;
                      const otherCharId = isSource ? rel.target_id : rel.source_id;
                      const otherChar = charMap[otherCharId];
                      const direction = isSource ? "→" : "←";

                      return (
                        <div key={rel.id} className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-lg p-3 group">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${rt.color}`}>
                            {rt.icon} {rt.label}
                          </span>
                          <span className="text-[var(--text-secondary)] text-xs">{direction}</span>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => { if (otherChar) selectCharacter(otherChar); }}
                              className="font-medium text-sm hover:text-lore-400 transition-colors truncate block"
                            >
                              {otherChar?.name || "Inconnu"}
                            </button>
                            {rel.description && (
                              <p className="text-xs text-[var(--text-secondary)] truncate">{rel.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteRelation(rel.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity"
                            title="Supprimer la relation"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
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

      {/* ── Modal création/édition personnage ── */}
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

      {/* ── Modal ajout relation ── */}
      {showRelationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">🔗 Nouvelle relation</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Depuis <span className="text-lore-400 font-medium">{selected?.name}</span>
            </p>
            <form onSubmit={handleAddRelation} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Personnage cible *</label>
                <select value={relationForm.target_id}
                  onChange={(e) => setRelationForm({ ...relationForm, target_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none">
                  <option value="">— Choisir —</option>
                  {availableTargets.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.title ? ` (${c.title})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Type de relation *</label>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {RELATION_CATEGORIES.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">{cat.label}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.types.map((rt) => (
                          <button key={rt.value} type="button"
                            onClick={() => setRelationForm({ ...relationForm, relation_type: rt.value })}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                              relationForm.relation_type === rt.value
                                ? `${rt.color} border-current`
                                : "border-white/5 text-[var(--text-secondary)] hover:bg-white/5"
                            }`}>
                            <span>{rt.icon}</span>
                            <span className="truncate">{rt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description (optionnel)</label>
                <input value={relationForm.description}
                  onChange={(e) => setRelationForm({ ...relationForm, description: e.target.value })}
                  placeholder="Frères d'armes depuis la bataille de..."
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
              </div>
              {relationError && <p className="text-red-400 text-sm">{relationError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRelationModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={savingRelation}
                  className="flex-1 px-4 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {savingRelation ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
