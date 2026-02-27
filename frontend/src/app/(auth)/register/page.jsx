"use client";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-white/10 focus:border-lore-500 focus:outline-none"
              placeholder="ton@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-white/10 focus:border-lore-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Confirmer</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-white/10 focus:border-lore-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            Créer mon compte
          </button>
        </form>
      </div>
    </main>
  );
}
