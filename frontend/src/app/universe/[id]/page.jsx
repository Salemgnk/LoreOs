"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { universes as universesApi, characters as charsApi, maps as mapsApi, chat as chatApi } from "@/lib/api";

export default function UniverseDashboard() {
  const { id } = useParams();
  const [universe, setUniverse] = useState(null);
  const [stats, setStats] = useState({ characters: 0, maps: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uni, chars, mapList, history] = await Promise.all([
          universesApi.get(id),
          charsApi.list(id),
          mapsApi.list(id),
          chatApi.history(id, 1000),
        ]);
        setUniverse(uni);
        setStats({
          characters: chars.length,
          maps: mapList.length,
          messages: history.length,
        });
      } catch (e) {
        console.error("Erreur chargement dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  const statCards = [
    { label: "Personnages", value: stats.characters, icon: "👥", href: `/universe/${id}/characters` },
    { label: "Cartes", value: stats.maps, icon: "🗺️", href: `/universe/${id}/map` },
    { label: "Messages LoreChat", value: stats.messages, icon: "🧠", href: `/universe/${id}/chat` },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-wide mb-1">{universe?.name || "Dashboard"}</h1>
        <p className="text-[var(--text-secondary)]">
          {universe?.description || "Vue d'ensemble de ton univers."}
        </p>
        <span className="inline-block mt-2 text-xs px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded">
          {universe?.genre}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-[var(--bg-card)] rounded-xl p-6 border border-white/5 hover:border-[var(--accent)]/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[var(--text-secondary)] text-sm">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2 group-hover:text-[var(--accent)] transition-colors">
              Voir →
            </p>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <h2 className="font-heading text-xl font-semibold tracking-wide mb-4">⚡ Actions rapides</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/universe/${id}/characters`}
          className="flex items-center gap-4 bg-[var(--bg-card)] rounded-xl p-5 border border-white/5 hover:border-[var(--accent)]/30 transition-all"
        >
          <span className="text-3xl">👥</span>
          <div>
            <p className="font-medium">Ajouter un personnage</p>
            <p className="text-sm text-[var(--text-secondary)]">Crée des fiches personnages détaillées</p>
          </div>
        </Link>
        <Link
          href={`/universe/${id}/map`}
          className="flex items-center gap-4 bg-[var(--bg-card)] rounded-xl p-5 border border-white/5 hover:border-[var(--accent)]/30 transition-all"
        >
          <span className="text-3xl">🗺️</span>
          <div>
            <p className="font-medium">Gérer les cartes</p>
            <p className="text-sm text-[var(--text-secondary)]">Cartes et lieux de ton monde</p>
          </div>
        </Link>
        <Link
          href={`/universe/${id}/chat`}
          className="flex items-center gap-4 bg-[var(--bg-card)] rounded-xl p-5 border border-white/5 hover:border-[var(--accent)]/30 transition-all"
        >
          <span className="text-3xl">🧠</span>
          <div>
            <p className="font-medium">Ouvrir LoreChat</p>
            <p className="text-sm text-[var(--text-secondary)]">Pose des questions à ton univers</p>
          </div>
        </Link>
        <div className="flex items-center gap-4 bg-[var(--bg-card)] rounded-xl p-5 border border-white/5 opacity-40">
          <span className="text-3xl">📜</span>
          <div>
            <p className="font-medium">Chroniques</p>
            <p className="text-sm text-[var(--text-secondary)]">Bientôt disponible (V1)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
