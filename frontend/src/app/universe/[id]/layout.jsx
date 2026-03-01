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
  { name: "ChronicleForge", path: "/chronicles", icon: "📜", v1: true },
  { name: "FactionEngine", path: "/factions", icon: "⚔️", v1: true },
  { name: "PantheonForge", path: "/pantheon", icon: "⛪", v1: true },
  // V2
  { name: "CultureWeaver", path: "/cultures", icon: "🏛️", v2: true },
  { name: "LangForge", path: "/langforge", icon: "🗣️", v2: true },
  { name: "ScriptForge", path: "/scriptforge", icon: "✍️", v2: true },
  { name: "EcosystemBuilder", path: "/ecosystem", icon: "🌿", v2: true },
];

export default function UniverseLayout({ children }) {
  const pathname = usePathname();
  const { id } = useParams();
  const basePath = `/universe/${id}`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] p-4 flex flex-col">
        <Link href="/" className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
            <span className="text-sm">⚙️</span>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold tracking-wider text-[var(--accent)]">LOREOS</p>
            <p className="text-[9px] text-[var(--text-secondary)] -mt-0.5">Worldbuilding Suite</p>
          </div>
        </Link>

        <div className="mt-4 mb-2">
          <p className="section-label !mb-3 !text-[9px]">MODULES</p>
        </div>

        <Link
          href="/universes"
          className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--accent)]/5 hover:text-[var(--text-primary)] border border-[var(--border)] transition-colors"
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
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent)]/5 hover:text-[var(--text-primary)]",
                  isLocked && "opacity-30 cursor-not-allowed"
                )}
              >
                <span className="text-sm">{mod.icon}</span>
                <span>{mod.name}</span>
                {mod.v1 && (
                  <span className="ml-auto text-[9px] bg-[var(--accent)]/10 text-[var(--accent)]/60 px-1.5 py-0.5 rounded font-medium">
                    V1
                  </span>
                )}
                {mod.v2 && (
                  <span className="ml-auto text-[9px] bg-white/3 text-[var(--text-secondary)] px-1.5 py-0.5 rounded font-medium">
                    V2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <p className="text-[9px] text-[var(--text-secondary)]/50 text-center italic mt-4 px-2">
          « Chaque monde mérite son grimoire »
        </p>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
