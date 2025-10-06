import type { Metadata } from "next";
import Sidebar from "./_components/Sidebar";
import {
  getCategoriesWithCounts,
  getTagsWithCounts,
  getLatestPosts,
  type CountItem,
  type PostListItem,
} from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog — TeamAction",
  description:
    "Artigos, vídeos e dicas sobre treino, tática e gestão de equipas amadoras.",
  openGraph: {
    title: "Blog — TeamAction",
    description:
      "Artigos, vídeos e dicas sobre treino, tática e gestão de equipas amadoras.",
    type: "website",
  },
};

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cats, tags, latest]: [CountItem[], CountItem[], PostListItem[]] =
    await Promise.all([
      getCategoriesWithCounts(),
      getTagsWithCounts(),
      getLatestPosts(5),
    ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0 space-y-6">{children}</section>
        <aside className="min-w-0">
          <Sidebar cats={cats} tags={tags} latest={latest} />
        </aside>
      </div>
    </main>
  );
}
