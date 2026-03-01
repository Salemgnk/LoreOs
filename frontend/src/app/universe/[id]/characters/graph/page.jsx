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
  Handle,
  Position,
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

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function CharacterNode({ data }) {
  const relCount = data.relationCount || 0;
  const initials = getInitials(data.name);
  return (
    <div className="relative group flex flex-col items-center" style={{ minWidth: 90 }}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-0 !w-3 !h-3" />

      {/* Avatar circle */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold tracking-wide transition-all group-hover:scale-110"
        style={{
          background: data.highlight ? "rgba(196,163,90,0.25)" : "rgba(196,163,90,0.12)",
          border: data.highlight ? "2px solid rgba(196,163,90,0.7)" : "2px solid rgba(196,163,90,0.3)",
          color: "var(--accent)",
          boxShadow: data.highlight ? "0 0 18px rgba(196,163,90,0.25)" : "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        {initials}
      </div>

      {/* Name label */}
      <div className="mt-1.5 text-center max-w-[100px]">
        <p className="font-heading text-[10px] text-[var(--text-primary)] uppercase tracking-wider truncate font-semibold">{data.name}</p>
        {data.title && (
          <p className="text-[9px] text-[var(--accent)] italic truncate">{data.title}</p>
        )}
        {relCount > 0 && (
          <p className="text-[8px] text-[var(--text-secondary)] opacity-60">{relCount} rel.</p>
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
  const [activeFilters, setActiveFilters] = useState(new Set()); // empty = show all

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
      activeFilters.size === 0
        ? allRelations
        : allRelations.filter((r) => activeFilters.has(r.relation_type));

    // Count relations per character
    const relCount = {};
    filteredRelations.forEach((r) => {
      relCount[r.source_id] = (relCount[r.source_id] || 0) + 1;
      relCount[r.target_id] = (relCount[r.target_id] || 0) + 1;
    });

    // If filtering, only show characters with relations
    const visibleChars =
      activeFilters.size === 0
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

    // Track parallel edges between same node pairs for offset
    const pairCount = {};
    const pairIndex = {};
    filteredRelations.forEach((r) => {
      const key = [r.source_id, r.target_id].sort().join("-");
      pairCount[key] = (pairCount[key] || 0) + 1;
    });

    const newEdges = filteredRelations
      .filter((r) => nodeIds.has(r.source_id) && nodeIds.has(r.target_id))
      .map((r) => {
        const style = getStyle(r.relation_type);
        const pairKey = [r.source_id, r.target_id].sort().join("-");
        const total = pairCount[pairKey] || 1;
        pairIndex[pairKey] = (pairIndex[pairKey] || 0) + 1;
        const idx = pairIndex[pairKey];

        // Offset parallel edges using different edge types
        let edgeType = "smoothstep";
        let pathOffset = {};
        if (total > 1) {
          const offsetVal = (idx - (total + 1) / 2) * 40;
          pathOffset = { pathOptions: { offset: offsetVal } };
        }

        return {
          id: r.id,
          source: r.source_id,
          target: r.target_id,
          label: `${style.icon} ${style.label}`,
          labelStyle: { fontSize: 9, fill: style.color, fontWeight: 600 },
          labelBgStyle: { fill: "rgba(15,14,11,0.92)", fillOpacity: 1 },
          labelBgPadding: [5, 3],
          labelBgBorderRadius: 4,
          style: { stroke: style.color, strokeWidth: 1.5 },
          animated: ["obsession", "forbidden", "bonded", "nemesis"].includes(r.relation_type),
          type: edgeType,
          ...pathOffset,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.color,
            width: 14,
            height: 14,
          },
        };
      });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [characters, allRelations, activeFilters, selectedNode]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  const toggleFilter = useCallback((type) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Unique types present in relations for filter
  const usedTypes = useMemo(() => {
    const types = new Set(allRelations.map((r) => r.relation_type));
    return Array.from(types).sort();
  }, [allRelations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🕸️</span>
          </div>
          <p className="font-medium mb-1">Aucun personnage</p>
          <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-xs mx-auto">Crée des personnages et des relations pour voir le graphe.</p>
          <Link href={`/universe/${universeId}/characters`} className="btn-primary">
            Personnages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-wide">Graphe des Relations</h1>
          <p className="text-[var(--text-secondary)] text-xs mt-0.5">
            {characters.length} personnage{characters.length !== 1 ? "s" : ""} · {allRelations.length} relation{allRelations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/universe/${universeId}/characters`} className="btn-ghost text-xs !px-3 !py-2">
          ← Personnages
        </Link>
      </div>

      {/* Graph */}
      <div className="flex-1 rounded-xl overflow-hidden border border-[var(--border)]" style={{ background: "rgba(15,14,11,0.9)" }}>
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
          <Background color="rgba(196,163,90,0.03)" gap={30} />
          <Controls
            style={{ background: "rgba(28,26,22,0.95)", border: "1px solid rgba(196,163,90,0.15)", borderRadius: 12 }}
          />
          <MiniMap
            nodeColor={() => "#c4a35a"}
            maskColor="rgba(0,0,0,0.7)"
            style={{
              background: "rgba(28,26,22,0.95)",
              border: "1px solid rgba(196,163,90,0.15)",
              borderRadius: 12,
            }}
          />

          {/* Filter panel — multi-select chips */}
          <Panel position="top-left">
            <div className="glass rounded-xl p-3 max-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">Filtrer</p>
                {activeFilters.size > 0 && (
                  <button onClick={() => setActiveFilters(new Set())} className="text-[10px] text-[var(--accent)] hover:text-[var(--accent-dim)] transition-colors">
                    Tout afficher
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {usedTypes.map((t) => {
                  const s = getStyle(t);
                  const count = allRelations.filter((r) => r.relation_type === t).length;
                  const isActive = activeFilters.has(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleFilter(t)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                        isActive
                          ? "border-current opacity-100"
                          : activeFilters.size > 0
                            ? "border-[var(--border)] opacity-40 hover:opacity-70"
                            : "border-[var(--border)] opacity-80 hover:opacity-100"
                      }`}
                      style={isActive ? { color: s.color, borderColor: s.color, background: `${s.color}15` } : {}}
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                      <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* Stats panel */}
          <Panel position="top-right">
            <div className="glass rounded-xl p-3 text-xs space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-medium">Stats</p>
              <p>👥 <span className="text-[var(--text-secondary)]">Personnages:</span> {characters.length}</p>
              <p>🔗 <span className="text-[var(--text-secondary)]">Relations:</span> {allRelations.length}</p>
              <p>🏷️ <span className="text-[var(--text-secondary)]">Types:</span> {usedTypes.length}</p>
              {selectedNode && (
                <div className="pt-1 mt-1 border-t border-[var(--border)]">
                  <p className="text-[var(--accent)] font-medium">
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
