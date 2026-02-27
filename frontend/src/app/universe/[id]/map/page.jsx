"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { maps as mapsApi } from "@/lib/api";

const EMPTY_MAP = { name: "", description: "" };
const EMPTY_MARKER = { name: "", description: "", marker_type: "location", x: 0, y: 0 };

export default function MapPage() {
  const { id: universeId } = useParams();
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapForm, setMapForm] = useState(EMPTY_MAP);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Carte sélectionnée + markers
  const [selectedMap, setSelectedMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [markerForm, setMarkerForm] = useState(EMPTY_MARKER);

  const fetchMaps = async () => {
    try {
      const data = await mapsApi.list(universeId);
      setMapList(data);
    } catch (e) {
      console.error("Erreur:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkers = async (mapId) => {
    try {
      const data = await mapsApi.getMarkers(universeId, mapId);
      setMarkers(data);
    } catch (e) {
      console.error("Erreur markers:", e);
      setMarkers([]);
    }
  };

  useEffect(() => { fetchMaps(); }, [universeId]);

  const selectMap = async (map) => {
    setSelectedMap(map);
    await fetchMarkers(map.id);
  };

  const handleCreateMap = async (e) => {
    e.preventDefault();
    if (!mapForm.name.trim()) return setError("Le nom est obligatoire");
    setSaving(true);
    setError("");
    try {
      const newMap = await mapsApi.create(universeId, mapForm);
      setShowMapModal(false);
      setMapForm(EMPTY_MAP);
      await fetchMaps();
      selectMap(newMap);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMap = async (mapId, name) => {
    if (!confirm(`Supprimer la carte "${name}" et tous ses marqueurs ?`)) return;
    try {
      // Use the raw request through the API client
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`${BASE_URL}/universes/${universeId}/maps/${mapId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (selectedMap?.id === mapId) {
        setSelectedMap(null);
        setMarkers([]);
      }
      await fetchMaps();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  const handleAddMarker = async (e) => {
    e.preventDefault();
    if (!markerForm.name.trim()) return setError("Le nom est obligatoire");
    setSaving(true);
    setError("");
    try {
      await mapsApi.addMarker(universeId, selectedMap.id, markerForm);
      setShowMarkerModal(false);
      setMarkerForm(EMPTY_MARKER);
      await fetchMarkers(selectedMap.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMarker = async (markerId, name) => {
    if (!confirm(`Supprimer le marqueur "${name}" ?`)) return;
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`${BASE_URL}/universes/${universeId}/maps/${selectedMap.id}/markers/${markerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMarkers(selectedMap.id);
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  const markerTypes = ["location", "city", "landmark", "region", "battle"];
  const markerIcons = { location: "📍", city: "🏙️", landmark: "🏔️", region: "🌍", battle: "⚔️" };

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
          <h1 className="text-3xl font-bold">🗺️ Cartes</h1>
          <p className="text-[var(--text-secondary)]">
            {mapList.length} carte{mapList.length !== 1 ? "s" : ""} dans cet univers
          </p>
        </div>
        <button onClick={() => { setError(""); setShowMapModal(true); }}
          className="px-4 py-2 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors">
          + Nouvelle carte
        </button>
      </div>

      {mapList.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-white/5 text-center text-[var(--text-secondary)]">
          <p className="text-4xl mb-4">🗺️</p>
          <p>Aucune carte pour l'instant.</p>
          <p className="text-sm mt-2">Crée ta première carte pour commencer à mapper ton monde.</p>
          <button onClick={() => { setError(""); setShowMapModal(true); }}
            className="mt-4 px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors">
            🗺️ Créer une carte
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Liste cartes */}
          <div className="w-full lg:w-1/3 space-y-3">
            {mapList.map((m) => (
              <div key={m.id} onClick={() => selectMap(m)}
                className={`bg-[var(--bg-card)] rounded-xl p-4 border cursor-pointer transition-all group ${
                  selectedMap?.id === m.id ? "border-lore-500/50 ring-1 ring-lore-500/20" : "border-white/5 hover:border-white/10"
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{m.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {m.description || "Pas de description"}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteMap(m.id, m.name); }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-opacity" title="Supprimer">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Détail carte + markers */}
          {selectedMap && (
            <div className="hidden lg:block w-2/3 bg-[var(--bg-card)] rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedMap.name}</h2>
                  {selectedMap.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedMap.description}</p>
                  )}
                </div>
                <button onClick={() => { setError(""); setMarkerForm(EMPTY_MARKER); setShowMarkerModal(true); }}
                  className="px-3 py-2 bg-lore-600/20 text-lore-400 hover:bg-lore-600/30 rounded-lg text-sm transition-colors">
                  + Ajouter un lieu
                </button>
              </div>

              {markers.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  <p className="text-3xl mb-2">📍</p>
                  <p>Aucun marqueur sur cette carte.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {markers.map((mk) => (
                    <div key={mk.id} className="flex items-center justify-between bg-[var(--bg-secondary)] rounded-lg p-3 group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{markerIcons[mk.marker_type] || "📍"}</span>
                        <div>
                          <p className="font-medium text-sm">{mk.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {mk.marker_type} • ({mk.x.toFixed(1)}, {mk.y.toFixed(1)})
                          </p>
                          {mk.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{mk.description}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMarker(mk.id, mk.name)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm transition-opacity">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modal nouvelle carte ── */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">🗺️ Nouvelle carte</h2>
            <form onSubmit={handleCreateMap} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom *</label>
                <input value={mapForm.name} onChange={(e) => setMapForm({ ...mapForm, name: e.target.value })}
                  placeholder="Carte du Continent Nord" autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={mapForm.description} onChange={(e) => setMapForm({ ...mapForm, description: e.target.value })}
                  placeholder="Les terres gelées au nord du monde connu..." rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMapModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal nouveau marqueur ── */}
      {showMarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">📍 Nouveau lieu</h2>
            <form onSubmit={handleAddMarker} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom *</label>
                <input value={markerForm.name} onChange={(e) => setMarkerForm({ ...markerForm, name: e.target.value })}
                  placeholder="Citadelle d'Ombrefer" autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Type</label>
                <select value={markerForm.marker_type} onChange={(e) => setMarkerForm({ ...markerForm, marker_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none">
                  {markerTypes.map((t) => (
                    <option key={t} value={t}>{markerIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={markerForm.description} onChange={(e) => setMarkerForm({ ...markerForm, description: e.target.value })}
                  placeholder="Une forteresse imprenable..." rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">X</label>
                  <input type="number" step="0.1" value={markerForm.x}
                    onChange={(e) => setMarkerForm({ ...markerForm, x: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Y</label>
                  <input type="number" step="0.1" value={markerForm.y}
                    onChange={(e) => setMarkerForm({ ...markerForm, y: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-white/10 focus:border-lore-500 focus:outline-none" />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMarkerModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
