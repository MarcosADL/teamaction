import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./_components/Navbar";

export const metadata: Metadata = {
  title: "TeamAction",
  description: "Plataforma TeamAction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-dvh flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="w-full border-t border-border bg-card text-sm text-muted-foreground text-center py-4">
          © {new Date().getFullYear()} TeamAction. Todos os direitos reservados.
        </footer>
      </body>
    </html>
  );
}
