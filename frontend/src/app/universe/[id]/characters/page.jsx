"use client";

export default function CharactersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">👥 Personnages</h1>
          <p className="text-[var(--text-secondary)]">
            Fiches personnages et graphe de relations.
          </p>
        </div>
        <button className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors">
          + Nouveau personnage
        </button>
      </div>

      {/* TODO: Liste des personnages + graphe de relations (React Flow) */}
      <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-white/5 text-center text-[var(--text-secondary)]">
        <p className="text-4xl mb-4">👥</p>
        <p>Aucun personnage pour l'instant.</p>
        <p className="text-sm mt-2">Crée ton premier personnage pour commencer.</p>
      </div>
    </div>
  );
}
