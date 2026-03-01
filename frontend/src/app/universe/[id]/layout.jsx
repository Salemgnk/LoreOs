"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { clsx } from "clsx";

const modules = [
  { name: "Dashboard", path: "", icon: "🏠" },
  { name: "Personnages", path: "/characters", icon: "👥" },
  { name: "Carte", path: "/map", icon: "🗺️" },
  { name: "LoreChat", path: "/chat", icon: "🧠" },
  // V1
  { name: "Chroniques", path: "/chronicles", icon: "📜", v1: true },
  { name: "Factions", path: "/factions", icon: "⚔️", v1: true },
  { name: "Panthéon", path: "/pantheon", icon: "⛪", v1: true },
  // V2
  { name: "Cultures", path: "/cultures", icon: "🏛️", v2: true },
  { name: "LangForge", path: "/langforge", icon: "🗣️", v2: true },
  { name: "ScriptForge", path: "/scriptforge", icon: "✍️", v2: true },
  { name: "Écosystème", path: "/ecosystem", icon: "🌿", v2: true },
];

export default function UniverseLayout({ children }) {
  const pathname = usePathname();
  const { id } = useParams();
  const basePath = `/universe/${id}`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-white/5 p-4 flex flex-col">
        <Link href="/" className="text-xl font-bold mb-4">
          🌍 Lore<span className="text-lore-500">OS</span>
        </Link>

        <Link
          href="/universes"
          className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/5 hover:text-white border border-white/5 transition-colors"
        >
          <span>←</span>
          <span>Mes Univers</span>
        </Link>

        <nav className="space-y-1 flex-1">
          {modules.map((mod) => {
            const href = `${basePath}${mod.path}`;
            const isActive = pathname === href;
            const isLocked = mod.v1 || mod.v2;

            return (
              <Link
                key={mod.path}
                href={isLocked ? "#" : href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-lore-600/20 text-lore-400"
                    : "text-[var(--text-secondary)] hover:bg-white/5",
                  isLocked && "opacity-40 cursor-not-allowed"
                )}
              >
                <span>{mod.icon}</span>
                <span>{mod.name}</span>
                {mod.v1 && (
                  <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                    V1
                  </span>
                )}
                {mod.v2 && (
                  <span className="ml-auto text-[10px] bg-gray-500/20 text-gray-400 px-1.5 py-0.5 rounded">
                    V2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
