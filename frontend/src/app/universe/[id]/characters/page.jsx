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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-lore-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personnages</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {characters.length} personnage{characters.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/universe/${universeId}/characters/graph`} className="btn-ghost text-xs !px-3 !py-2 flex items-center gap-1.5">
            <span className="text-sm">🕸️</span> Graphe
          </Link>
          <button onClick={openCreate} className="btn-primary text-xs !px-3 !py-2">+ Nouveau</button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-lore-600/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p className="font-medium mb-1">Aucun personnage</p>
          <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-xs mx-auto">Crée ton premier personnage pour commencer.</p>
          <button onClick={openCreate} className="btn-primary">Créer un personnage</button>
        </div>
      ) : (
        <div className={`flex gap-5 ${selected ? "" : ""}`}>
          {/* ── Liste personnages ── */}
          <div className={`${selected ? "w-full lg:w-2/5" : "w-full"} transition-all`}>
            <div className={`grid gap-3 ${selected ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
              {characters.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCharacter(c)}
                  className={`card cursor-pointer group relative overflow-hidden ${
                    selected?.id === c.id ? "!border-lore-500/40 ring-1 ring-lore-500/15" : ""
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-tight">{c.name}</h3>
                        {c.title && <p className="text-xs text-lore-400 mt-0.5">{c.title}</p>}
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-xs text-[var(--text-secondary)] hover:text-lore-400" title="Modifier">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); }} className="text-xs text-[var(--text-secondary)] hover:text-red-400" title="Supprimer">✕</button>
                      </div>
                    </div>
                    {c.location && <p className="text-[11px] text-[var(--text-secondary)] mt-1">📍 {c.location}</p>}
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                      {c.description || "Pas de description"}
                    </p>
                    {c.traits?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.traits.slice(0, 4).map((t) => (
                          <span key={t} className="chip text-[10px] !px-1.5 !py-0.5">{t}</span>
                        ))}
                        {c.traits.length > 4 && (
                          <span className="text-[10px] text-[var(--text-secondary)] self-center">+{c.traits.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-lore-500 to-lore-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Fiche détail + Relations ── */}
          {selected && (
            <div className="hidden lg:block w-3/5 card sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    {selected.title && <p className="text-lore-400 text-xs mt-0.5">{selected.title}</p>}
                  </div>
                  <button onClick={() => { setSelected(null); setRelations([]); }} className="text-[var(--text-secondary)] hover:text-white text-sm">✕</button>
                </div>

                {selected.location && (
                  <p className="text-xs mb-3 text-[var(--text-secondary)]">📍 {selected.location}</p>
                )}

                {selected.traits?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider font-medium">Traits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.traits.map((t) => (
                        <span key={t} className="chip chip-active text-[11px]">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider font-medium">Description</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {selected.backstory && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider font-medium">Backstory</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.backstory}</p>
                  </div>
                )}

                {selected.notes && (
                  <div className="mb-4">
                    <p className="text-[10px] text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider font-medium">Notes</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                  </div>
                )}

                {/* ── Relations ── */}
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                      Relations ({relations.length})
                    </p>
                    {availableTargets.length > 0 && (
                      <button onClick={openAddRelation} className="chip chip-active text-[10px] hover:brightness-110">+ Ajouter</button>
                    )}
                  </div>

                  {loadingRelations ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-lore-500 border-t-transparent" />
                    </div>
                  ) : relations.length === 0 ? (
                    <div className="text-center py-5 text-[var(--text-secondary)]">
                      <p className="text-lg mb-1">🔗</p>
                      <p className="text-xs">Aucune relation.</p>
                      {availableTargets.length > 0 && (
                        <button onClick={openAddRelation} className="mt-2 text-[11px] text-lore-400 hover:text-lore-300 transition-colors">
                          Ajouter une relation →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {relations.map((rel) => {
                        const rt = getRelationType(rel.relation_type);
                        const isSource = rel.source_id === selected.id;
                        const otherCharId = isSource ? rel.target_id : rel.source_id;
                        const otherChar = charMap[otherCharId];
                        const direction = isSource ? "→" : "←";

                        return (
                          <div key={rel.id} className="flex items-center gap-2.5 rounded-lg p-2.5 group hover:bg-white/[0.02] transition-colors">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${rt.color}`}>
                              {rt.icon} {rt.label}
                            </span>
                            <span className="text-[var(--text-secondary)] text-[10px]">{direction}</span>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => { if (otherChar) selectCharacter(otherChar); }}
                                className="font-medium text-xs hover:text-lore-400 transition-colors truncate block"
                              >
                                {otherChar?.name || "Inconnu"}
                              </button>
                              {rel.description && (
                                <p className="text-[10px] text-[var(--text-secondary)] truncate">{rel.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteRelation(rel.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-[10px] transition-opacity"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-[var(--border)]">
                  <button onClick={() => openEdit(selected)} className="btn-ghost flex-1 text-xs !py-2">✏️ Modifier</button>
                  <button onClick={() => handleDelete(selected.id, selected.name)} className="text-xs px-3 py-2 rounded-lg bg-red-500/8 text-red-400 hover:bg-red-500/15 transition-colors border border-red-500/10">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal création/édition personnage ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5">
              {editing ? `Modifier ${editing.name}` : "Nouveau personnage"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Nom *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aragorn" className="input" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Titre</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Roi du Gondor" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Lieu</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Minas Tirith" className="input" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Un rôdeur au passé mystérieux..." rows={3} className="input resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Backstory</label>
                <textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                  placeholder="Né héritier du trône, il a grandi en exil..." rows={3} className="input resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Traits de personnalité</label>
                <div className="flex gap-2">
                  <input value={traitInput} onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrait(); } }}
                    placeholder="Courageux, Loyal..." className="input !py-2 flex-1" />
                  <button type="button" onClick={addTrait} className="btn-ghost !px-3 !py-2 text-sm">+</button>
                </div>
                {form.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.traits.map((t) => (
                      <span key={t} className="chip chip-active text-[11px]">
                        {t}
                        <button type="button" onClick={() => removeTrait(t)} className="hover:text-red-300 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes libres..." rows={2} className="input resize-none" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                  {saving ? "Sauvegarde..." : editing ? "Sauvegarder" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal ajout relation ── */}
      {showRelationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-1">Nouvelle relation</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Depuis <span className="text-lore-400 font-medium">{selected?.name}</span>
            </p>
            <form onSubmit={handleAddRelation} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Personnage cible *</label>
                <select value={relationForm.target_id}
                  onChange={(e) => setRelationForm({ ...relationForm, target_id: e.target.value })}
                  className="input">
                  <option value="">— Choisir —</option>
                  {availableTargets.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.title ? ` (${c.title})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Type de relation *</label>
                <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                  {RELATION_CATEGORIES.map((cat) => (
                    <div key={cat.label}>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-medium">{cat.label}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {cat.types.map((rt) => (
                          <button key={rt.value} type="button"
                            onClick={() => setRelationForm({ ...relationForm, relation_type: rt.value })}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] transition-all border ${
                              relationForm.relation_type === rt.value
                                ? `${rt.color} border-current`
                                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/[0.03]"
                            }`}>
                            <span className="text-xs">{rt.icon}</span>
                            <span className="truncate">{rt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Description (optionnel)</label>
                <input value={relationForm.description}
                  onChange={(e) => setRelationForm({ ...relationForm, description: e.target.value })}
                  placeholder="Frères d'armes depuis la bataille de..." className="input" />
              </div>
              {relationError && <p className="text-red-400 text-sm">{relationError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowRelationModal(false)} className="btn-ghost flex-1">Annuler</button>
                <button type="submit" disabled={savingRelation} className="btn-primary flex-1 disabled:opacity-50">
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
