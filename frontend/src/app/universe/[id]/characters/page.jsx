"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { characters as charsApi } from "@/lib/api";

const EMPTY_FORM = {
  name: "", title: "", description: "", traits: [], location: "",
  backstory: "", notes: "", age: "", occupation: "", appearance: "",
  powers: "", objectives: "", quotes: [],
};

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

// Helper: get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function CharactersPage() {
  const { id: universeId } = useParams();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [traitInput, setTraitInput] = useState("");
  const [quoteInput, setQuoteInput] = useState("");
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
      age: char.age || "",
      occupation: char.occupation || "",
      appearance: char.appearance || "",
      powers: char.powers || "",
      objectives: char.objectives || "",
      quotes: char.quotes || [],
    });
    setTraitInput("");
    setQuoteInput("");
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

  const addQuote = () => {
    if (quoteInput.trim() && !form.quotes.includes(quoteInput.trim())) {
      setForm({ ...form, quotes: [...form.quotes, quoteInput.trim()] });
      setQuoteInput("");
    }
  };
  const removeQuote = (q) => setForm({ ...form, quotes: form.quotes.filter((x) => x !== q) });

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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-wide">CharacterGraph</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Fiches personnages &amp; graphe de relations
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs !px-4 !py-2 flex items-center gap-1.5">+ Nouveau Personnage</button>
      </div>

      {/* Gallery / Graph toggle */}
      <div className="flex items-center gap-0 mb-6">
        <div className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
          <span className="px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] font-medium flex items-center gap-1.5">
            <span>👥</span> Galerie
          </span>
          <Link href={`/universe/${universeId}/characters/graph`} className="px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/5 flex items-center gap-1.5 transition-colors">
            <span>🕸️</span> Graphe
          </Link>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/8 flex items-center justify-center mx-auto mb-4">
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
                    selected?.id === c.id ? "!border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/10" : ""
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="avatar w-9 h-9 text-xs">{getInitials(c.name)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <h3 className="font-heading text-sm font-semibold tracking-wide leading-tight uppercase">{c.name}</h3>
                            {c.title && <p className="text-[11px] text-[var(--accent)] mt-0.5 italic">{c.title}</p>}
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]" title="Modifier">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name); }} className="text-xs text-[var(--text-secondary)] hover:text-red-400" title="Supprimer">✕</button>
                          </div>
                        </div>
                        {c.traits?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.traits.slice(0, 3).map((t) => (
                              <span key={t} className="chip text-[10px] !px-1.5 !py-0.5">{t}</span>
                            ))}
                            {c.traits.length > 3 && (
                              <span className="text-[10px] text-[var(--text-secondary)] self-center">+{c.traits.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2.5 line-clamp-2 leading-relaxed">
                      {c.description || "Pas de description"}
                    </p>
                    {c.traits?.length > 0 && !selected && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.traits.slice(3, 6).map((t) => (
                          <span key={t} className="chip text-[10px] !px-1.5 !py-0.5">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--accent)]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Fiche détail + Relations ── */}
          {selected && (
            <div className="hidden lg:block w-3/5 card sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="p-5">
                {/* Header with avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar w-12 h-12 text-base">{getInitials(selected.name)}</div>
                    <div>
                      <h2 className="font-heading text-lg font-semibold tracking-wide uppercase">{selected.name}</h2>
                      {selected.title && <p className="text-[var(--accent)] text-xs italic">{selected.title}</p>}
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setRelations([]); }} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">✕</button>
                </div>

                {/* Quick info chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selected.age && <span className="chip text-[11px]">{selected.age}</span>}
                  {selected.occupation && <span className="chip text-[11px]">{selected.occupation}</span>}
                  {selected.location && <span className="chip text-[11px]">📍 {selected.location}</span>}
                </div>

                {selected.traits?.length > 0 && (
                  <div className="mb-4">
                    <p className="section-label">Traits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.traits.map((t) => (
                        <span key={t} className="chip chip-active text-[11px]">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div className="mb-4">
                    <p className="section-label">Description</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {selected.appearance && (
                  <div className="mb-4">
                    <p className="section-label">Apparence</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.appearance}</p>
                  </div>
                )}

                {selected.backstory && (
                  <div className="mb-4">
                    <p className="section-label">Backstory</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.backstory}</p>
                  </div>
                )}

                {selected.powers && (
                  <div className="mb-4">
                    <p className="section-label">Pouvoirs / Capacités</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.powers}</p>
                  </div>
                )}

                {selected.objectives && (
                  <div className="mb-4">
                    <p className="section-label">Objectifs</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.objectives}</p>
                  </div>
                )}

                {selected.quotes?.length > 0 && (
                  <div className="mb-4">
                    <p className="section-label">Citations</p>
                    <div className="space-y-2">
                      {selected.quotes.map((q, i) => (
                        <blockquote key={i} className="text-sm italic border-l-2 border-[var(--accent)]/30 pl-3 text-[var(--text-secondary)]">
                          « {q} »
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div className="mb-4">
                    <p className="section-label">Notes</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                  </div>
                )}

                {/* ── Relations ── */}
                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="section-label !mb-0">
                      Relations ({relations.length})
                    </p>
                    {availableTargets.length > 0 && (
                      <button onClick={openAddRelation} className="chip chip-active text-[10px] hover:brightness-110">+ Ajouter</button>
                    )}
                  </div>

                  {loadingRelations ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--accent)] border-t-transparent" />
                    </div>
                  ) : relations.length === 0 ? (
                    <div className="text-center py-5 text-[var(--text-secondary)]">
                      <p className="text-lg mb-1">🔗</p>
                      <p className="text-xs">Aucune relation.</p>
                      {availableTargets.length > 0 && (
                        <button onClick={openAddRelation} className="mt-2 text-[11px] text-[var(--accent)] hover:brightness-110 transition-colors">
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
                                className="font-medium text-xs hover:text-[var(--accent)] transition-colors truncate block"
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
          <div className="glass rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-lg font-semibold tracking-wide mb-5">
              {editing ? `Modifier ${editing.name}` : "Nouveau Personnage"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              {/* Row 1: Name, Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label">Nom *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Raven Accrombessi" className="input" autoFocus />
                </div>
                <div>
                  <label className="section-label">Titre / Rôle</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Archimage du Cercle d'Argent" className="input" />
                </div>
              </div>
              {/* Row 2: Age, Occupation, Location */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="section-label">Âge</label>
                  <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="20 ans" className="input" />
                </div>
                <div>
                  <label className="section-label">Occupation</label>
                  <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    placeholder="Étudiante en informatique" className="input" />
                </div>
                <div>
                  <label className="section-label">Lieu</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Cotonou" className="input" />
                </div>
              </div>
              {/* Traits */}
              <div>
                <label className="section-label">Traits de personnalité</label>
                <div className="flex gap-2">
                  <input value={traitInput} onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTrait(); } }}
                    placeholder="Manipulatrice, Charismatique..." className="input !py-2 flex-1" />
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
              {/* Description */}
              <div>
                <label className="section-label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Membre influent du BDE, manipulatrice naturelle..." rows={3} className="input resize-none" />
              </div>
              {/* Appearance */}
              <div>
                <label className="section-label">Apparence physique</label>
                <textarea value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })}
                  placeholder="Taille, corpulence, traits distinctifs..." rows={3} className="input resize-none" />
              </div>
              {/* Backstory */}
              <div>
                <label className="section-label">Backstory</label>
                <textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                  placeholder="Née dans une famille de classe moyenne-supérieure..." rows={3} className="input resize-none" />
              </div>
              {/* Powers */}
              <div>
                <label className="section-label">Pouvoirs / Capacités</label>
                <textarea value={form.powers} onChange={(e) => setForm({ ...form, powers: e.target.value })}
                  placeholder="Suggestion mentale, manipulation psychique..." rows={3} className="input resize-none" />
              </div>
              {/* Objectives */}
              <div>
                <label className="section-label">Objectifs & Motivations</label>
                <textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  placeholder="Court, moyen et long terme..." rows={3} className="input resize-none" />
              </div>
              {/* Quotes */}
              <div>
                <label className="section-label">Citations</label>
                <div className="flex gap-2">
                  <input value={quoteInput} onChange={(e) => setQuoteInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuote(); } }}
                    placeholder="« Je ne suis pas devenue un monstre... »" className="input !py-2 flex-1" />
                  <button type="button" onClick={addQuote} className="btn-ghost !px-3 !py-2 text-sm">+</button>
                </div>
                {form.quotes.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {form.quotes.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="italic text-[var(--text-secondary)] flex-1 border-l-2 border-[var(--accent)]/20 pl-2">« {q} »</span>
                        <button type="button" onClick={() => removeQuote(q)} className="text-[var(--text-secondary)] hover:text-red-400 shrink-0">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Notes */}
              <div>
                <label className="section-label">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes libres pour l'écriture..." rows={2} className="input resize-none" />
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
            <h2 className="font-heading text-lg font-semibold tracking-wide mb-1">Nouvelle relation</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Depuis <span className="text-[var(--accent)] font-medium">{selected?.name}</span>
            </p>
            <form onSubmit={handleAddRelation} className="space-y-4">
              <div>
                <label className="section-label">Personnage cible *</label>
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
                <label className="section-label mb-2">Type de relation *</label>
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
                <label className="section-label">Description (optionnel)</label>
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
