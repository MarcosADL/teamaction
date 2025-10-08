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
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
      </body>
    </html>
  );
}
