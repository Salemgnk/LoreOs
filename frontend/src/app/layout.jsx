import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "LoreOS — Worldbuilding Suite",
  description:
    "Worldbuilding, langues, religions, cultures, personnages et histoire — dans un seul grimoire.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
