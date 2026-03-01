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
      <aside className="w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] p-4 flex flex-col">
        <Link href="/" className="text-lg font-bold mb-3 tracking-tight">
          Lore<span className="text-lore-400">OS</span>
        </Link>

        <Link
          href="/universes"
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
        >
          <span>←</span>
          <span>Mes Univers</span>
        </Link>

        <nav className="space-y-0.5 flex-1">
          {modules.map((mod) => {
            const href = `${basePath}${mod.path}`;
            const isActive = pathname === href;
            const isLocked = mod.v1 || mod.v2;

            return (
              <Link
                key={mod.path}
                href={isLocked ? "#" : href}
                className={clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                  isActive
                    ? "bg-lore-600/15 text-lore-400 font-medium"
                    : "text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-[var(--text-primary)]",
                  isLocked && "opacity-30 cursor-not-allowed"
                )}
              >
                <span className="text-sm">{mod.icon}</span>
                <span>{mod.name}</span>
                {mod.v1 && (
                  <span className="ml-auto text-[9px] bg-yellow-500/15 text-yellow-400/80 px-1.5 py-0.5 rounded font-medium">
                    V1
                  </span>
                )}
                {mod.v2 && (
                  <span className="ml-auto text-[9px] bg-white/5 text-[var(--text-secondary)] px-1.5 py-0.5 rounded font-medium">
                    V2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
