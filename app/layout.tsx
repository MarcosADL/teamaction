import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://teamaction.example.com"),
  title: {
    default: "TeamAction",
    template: "%s — TeamAction",
  },
  description:
    "Plataforma para clubes/equipas amadoras: blog com artigos, vídeos e dicas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="border-t">
          <div className="mx-auto max-w-6xl p-4 text-sm text-muted-foreground">
            © {new Date().getFullYear()} TeamAction
          </div>
        </footer>
      </body>
    </html>
  );
}
