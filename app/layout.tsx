// app/layout.tsx (RAIZ) — público
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TeamAction",
  description: "Plataforma TeamAction.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
