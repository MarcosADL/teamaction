// app/layout.tsx
export const runtime = "nodejs";
import "./globals.css";
import SiteHeader from "@/components/site-header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
