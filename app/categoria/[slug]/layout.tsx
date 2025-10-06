import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { slug } = params;
  const title = `Categoria: ${slug} — TeamAction`;
  const description = `Artigos da categoria ${slug}`;
  return { title, description };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
