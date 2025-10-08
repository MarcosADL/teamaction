// components/site-header.tsx
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const revalidate = 0; // sempre atual

function firstName(name?: string) {
  if (!name) return "";
  const f = String(name).trim().split(/\s+/)[0];
  return f || "";
}

export default async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl items-center justify-between px-4 py-3 flex">
        <Link href="/" className="text-lg font-semibold">
          TeamAction
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/blog" className="hover:underline">
            Blog
          </Link>

          {session.role === "admin" && (
            <Link href="/backoffice" className="hover:underline">
              Backoffice
            </Link>
          )}

          {!session.authenticated ? (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-80">
                {firstName(session.email || undefined)}
              </span>
              <LogoutButton />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
