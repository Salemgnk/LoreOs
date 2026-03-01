"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { characters as charsApi } from "@/lib/api";

// ── Palette des types de relation (même logique que la page persos) ──

const RELATION_STYLE = {
  // Liens sociaux
  ally:       { color: "#4ade80", label: "Allié", icon: "🤝" },
  enemy:      { color: "#f87171", label: "Ennemi", icon: "⚔️" },
  rival:      { color: "#fb923c", label: "Rival", icon: "🔥" },
  friend:     { color: "#22d3ee", label: "Ami·e", icon: "😊" },
  betrayer:   { color: "#fb7185", label: "Traître", icon: "🗡️" },
  protector:  { color: "#38bdf8", label: "Protecteur", icon: "🛡️" },
  // Famille
  family:     { color: "#60a5fa", label: "Famille", icon: "👨‍👩‍👧" },
  parent:     { color: "#93c5fd", label: "Parent", icon: "👤" },
  child:      { color: "#bfdbfe", label: "Enfant", icon: "👶" },
  sibling:    { color: "#818cf8", label: "Frère/Sœur", icon: "👫" },
  twin:       { color: "#a5b4fc", label: "Jumeau·elle", icon: "♊" },
  ancestor:   { color: "#a8a29e", label: "Ancêtre", icon: "🏛️" },
  // Pouvoir
  mentor:     { color: "#c084fc", label: "Mentor", icon: "🎓" },
  apprentice: { color: "#d8b4fe", label: "Apprenti·e", icon: "📚" },
  master:     { color: "#facc15", label: "Maître", icon: "👑" },
  servant:    { color: "#9ca3af", label: "Serviteur", icon: "🙇" },
  vassal:     { color: "#fbbf24", label: "Vassal", icon: "⚜️" },
  captor:     { color: "#71717a", label: "Geôlier", icon: "🔒" },
  prisoner:   { color: "#a1a1aa", label: "Prisonnier·e", icon: "⛓️" },
  // Romance
  lover:      { color: "#f472b6", label: "Amant·e", icon: "❤️" },
  ex:         { color: "#f9a8d4", label: "Ex", icon: "💔" },
  crush:      { color: "#fda4af", label: "Crush", icon: "💘" },
  spouse:     { color: "#fbcfe8", label: "Époux·se", icon: "💍" },
  forbidden:  { color: "#fca5a5", label: "Interdit", icon: "🚫❤️" },
  obsession:  { color: "#e879f9", label: "Obsession", icon: "🖤" },
  soulmate:   { color: "#a78bfa", label: "Âme sœur", icon: "✨" },
  dominant:   { color: "#ef4444", label: "Dominant·e", icon: "🔱" },
  submissive: { color: "#fca5a5", label: "Soumis·e", icon: "🌹" },
  seducer:    { color: "#f0abfc", label: "Séducteur·rice", icon: "💋" },
  // Surnaturel
  bonded:     { color: "#a78bfa", label: "Lié·e magique", icon: "🔮" },
  summoner:   { color: "#2dd4bf", label: "Invocateur", icon: "🌀" },
  familiar:   { color: "#34d399", label: "Familier", icon: "🐾" },
  creator:    { color: "#fde047", label: "Créateur·rice", icon: "⚡" },
  creation:   { color: "#67e8f9", label: "Création", icon: "🤖" },
  host:       { color: "#a3e635", label: "Hôte", icon: "🧬" },
  parasite:   { color: "#86efac", label: "Parasite", icon: "🦠" },
  deity:      { color: "#fcd34d", label: "Divinité", icon: "☀️" },
  worshipper: { color: "#fde68a", label: "Adorateur·rice", icon: "🙏" },
  // Sombre
  nemesis:    { color: "#dc2626", label: "Némésis", icon: "💀" },
  manipulator:{ color: "#f59e0b", label: "Manipulateur", icon: "🎭" },
  victim:     { color: "#94a3b8", label: "Victime", icon: "😢" },
  accomplice: { color: "#a3a3a3", label: "Complice", icon: "🤫" },
  hunter:     { color: "#ea580c", label: "Chasseur", icon: "🏹" },
  prey:       { color: "#fdba74", label: "Proie", icon: "🎯" },
  torturer:   { color: "#6b7280", label: "Bourreau", icon: "⚰️" },
};

const getStyle = (type) => RELATION_STYLE[type] || { color: "#6b7280", label: type, icon: "🔗" };

// ── Custom node ──

function CharacterNode({ data }) {
  const relCount = data.relationCount || 0;
  return (
    <div
      className="relative group"
      style={{ minWidth: 140 }}
    >
      <div
        className="rounded-xl px-4 py-3 border shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
        style={{
          background: "rgba(30, 30, 40, 0.95)",
          borderColor: data.highlight ? "#a855f7" : "rgba(255,255,255,0.08)",
          boxShadow: data.highlight ? "0 0 20px rgba(168, 85, 247, 0.3)" : "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <p className="font-bold text-sm text-white text-center truncate">{data.name}</p>
        {data.title && (
          <p className="text-[10px] text-center text-purple-300 truncate">{data.title}</p>
        )}
        {data.location && (
          <p className="text-[10px] text-center text-gray-400 truncate">📍 {data.location}</p>
        )}
        {relCount > 0 && (
          <p className="text-[9px] text-center text-gray-500 mt-1">
            {relCount} relation{relCount > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

const nodeTypes = { character: CharacterNode };

// ── Layout helpers : force-directed-like placement ──

function circularLayout(count, radius = 300) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius + radius + 100,
      y: Math.sin(angle) * radius + radius + 100,
    };
  });
}

// ── Main component ──

export default function GraphPage() {
  const { id: universeId } = useParams();
  const [characters, setCharacters] = useState([]);
  const [allRelations, setAllRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Fetch all data
  useEffect(() => {
    async function load() {
      try {
        const chars = await charsApi.list(universeId);
        setCharacters(chars);

        // Fetch relations for each character
        const relPromises = chars.map((c) =>
          charsApi.getRelations(universeId, c.id).catch(() => [])
        );
        const relArrays = await Promise.all(relPromises);

        // Deduplicate relations (same relation may appear from both sides)
        const seen = new Set();
        const unique = [];
        relArrays.flat().forEach((r) => {
          if (!seen.has(r.id)) {
            seen.add(r.id);
            unique.push(r);
          }
        });
        setAllRelations(unique);
      } catch (e) {
        console.error("Erreur chargement graphe:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [universeId]);

  // Build graph when data or filter changes
  useEffect(() => {
    if (characters.length === 0) return;

    const filteredRelations =
      filterType === "all"
        ? allRelations
        : allRelations.filter((r) => r.relation_type === filterType);

    // Count relations per character
    const relCount = {};
    filteredRelations.forEach((r) => {
      relCount[r.source_id] = (relCount[r.source_id] || 0) + 1;
      relCount[r.target_id] = (relCount[r.target_id] || 0) + 1;
    });

    // If filtering, only show characters with relations
    const visibleChars =
      filterType === "all"
        ? characters
        : characters.filter((c) => relCount[c.id]);

    const positions = circularLayout(visibleChars.length, Math.max(200, visibleChars.length * 40));

    const newNodes = visibleChars.map((c, i) => ({
      id: c.id,
      type: "character",
      position: positions[i] || { x: 100 + i * 180, y: 100 },
      data: {
        name: c.name,
        title: c.title,
        location: c.location,
        relationCount: relCount[c.id] || 0,
        highlight: selectedNode === c.id,
      },
    }));

    const nodeIds = new Set(visibleChars.map((c) => c.id));
    const newEdges = filteredRelations
      .filter((r) => nodeIds.has(r.source_id) && nodeIds.has(r.target_id))
      .map((r) => {
        const style = getStyle(r.relation_type);
        return {
          id: r.id,
          source: r.source_id,
          target: r.target_id,
          label: `${style.icon} ${style.label}`,
          labelStyle: { fontSize: 10, fill: style.color, fontWeight: 600 },
          labelBgStyle: { fill: "rgba(15,15,20,0.85)", fillOpacity: 0.9 },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 6,
          style: { stroke: style.color, strokeWidth: 2 },
          animated: ["obsession", "forbidden", "bonded", "nemesis"].includes(r.relation_type),
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.color,
            width: 16,
            height: 16,
          },
        };
      });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [characters, allRelations, filterType, selectedNode]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  // Unique types present in relations for filter
  const usedTypes = useMemo(() => {
    const types = new Set(allRelations.map((r) => r.relation_type));
    return Array.from(types).sort();
  }, [allRelations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lore-500 mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Chargement du graphe…</p>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="text-5xl mb-4">🕸️</p>
          <p className="text-lg font-semibold">Aucun personnage</p>
          <p className="text-[var(--text-secondary)] mb-4">Crée des personnages et des relations pour voir le graphe.</p>
          <Link
            href={`/universe/${universeId}/characters`}
            className="inline-block px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            👥 Personnages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">🕸️ Graphe des relations</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {characters.length} personnage{characters.length !== 1 ? "s" : ""} · {allRelations.length} relation{allRelations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href={`/universe/${universeId}/characters`}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 flex items-center gap-2"
        >
          ← Personnages
        </Link>
      </div>

      {/* Graph */}
      <div className="flex-1 rounded-xl overflow-hidden border border-white/5" style={{ background: "rgba(10,10,15,0.8)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
        >
          <Background color="rgba(255,255,255,0.03)" gap={30} />
          <Controls
            style={{ background: "rgba(30,30,40,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
          />
          <MiniMap
            nodeColor={() => "#a855f7"}
            maskColor="rgba(0,0,0,0.7)"
            style={{
              background: "rgba(20,20,30,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
            }}
          />

          {/* Filter panel */}
          <Panel position="top-left">
            <div className="bg-[rgba(20,20,30,0.95)] backdrop-blur-sm rounded-xl border border-white/10 p-3 max-w-[220px]">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-2">Filtrer par type</p>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 focus:border-lore-500 focus:outline-none text-white"
              >
                <option value="all">Tous les types ({allRelations.length})</option>
                {usedTypes.map((t) => {
                  const s = getStyle(t);
                  const count = allRelations.filter((r) => r.relation_type === t).length;
                  return (
                    <option key={t} value={t}>
                      {s.icon} {s.label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* Legend */}
              {usedTypes.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Légende</p>
                  {usedTypes.map((t) => {
                    const s = getStyle(t);
                    return (
                      <div key={t} className="flex items-center gap-2 text-[11px]">
                        <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span style={{ color: s.color }}>{s.icon} {s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Panel>

          {/* Stats panel */}
          <Panel position="top-right">
            <div className="bg-[rgba(20,20,30,0.95)] backdrop-blur-sm rounded-xl border border-white/10 p-3 text-xs space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Stats</p>
              <p className="text-white">👥 <span className="text-[var(--text-secondary)]">Personnages:</span> {characters.length}</p>
              <p className="text-white">🔗 <span className="text-[var(--text-secondary)]">Relations:</span> {allRelations.length}</p>
              <p className="text-white">🏷️ <span className="text-[var(--text-secondary)]">Types:</span> {usedTypes.length}</p>
              {selectedNode && (
                <div className="pt-1 mt-1 border-t border-white/10">
                  <p className="text-lore-400 font-medium">
                    {characters.find((c) => c.id === selectedNode)?.name}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    {allRelations.filter((r) => r.source_id === selectedNode || r.target_id === selectedNode).length} relation(s)
                  </p>
                </div>
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
