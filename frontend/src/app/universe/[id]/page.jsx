export default function UniverseDashboard({ params }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Vue d'ensemble de ton univers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat cards */}
        {[
          { label: "Personnages", value: "–", icon: "👥" },
          { label: "Lieux", value: "–", icon: "📍" },
          { label: "Messages LoreChat", value: "–", icon: "🧠" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-card)] rounded-xl p-6 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[var(--text-secondary)] text-sm">
                {stat.label}
              </span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
