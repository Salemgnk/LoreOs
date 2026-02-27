"use client";

export default function MapPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🗺️ Carte du monde</h1>
          <p className="text-[var(--text-secondary)]">
            Upload ta carte et ajoute des annotations.
          </p>
        </div>
        <button className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors">
          + Nouvelle carte
        </button>
      </div>

      {/* TODO: Éditeur de carte (Leaflet.js ou Konva.js) */}
      <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-white/5 text-center text-[var(--text-secondary)] min-h-[500px] flex items-center justify-center">
        <div>
          <p className="text-4xl mb-4">🗺️</p>
          <p>Aucune carte pour l'instant.</p>
          <p className="text-sm mt-2">Upload une image de ta carte pour commencer.</p>
        </div>
      </div>
    </div>
  );
}
