import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "LoreOS — Le cerveau de ton univers fictif",
  description:
    "Worldbuilding, langues, religions, cultures, personnages et histoire dans une seule app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
