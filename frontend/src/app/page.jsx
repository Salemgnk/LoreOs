import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">
          🌍 Lore<span className="text-lore-500">OS</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">
          Le système d'exploitation de l'écrivain fantasy.
          <br />
          Worldbuilding, langues, religions, cultures, personnages et histoire
          dans une seule app.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-lore-600 hover:bg-lore-700 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-lore-600 hover:bg-lore-600/10 rounded-lg font-medium transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
