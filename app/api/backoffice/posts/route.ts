import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts, createPost } from "@/lib/posts";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json({ items: posts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const post = await createPost({
      title: String(body.title ?? ""),
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      content: String(body.content ?? ""),
      date: body.date ? String(body.date) : undefined,
      categories: Array.isArray(body.categories) ? body.categories : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage ? String(body.coverImage) : undefined,
      videoUrl:
        body.videoUrl
          ? String(body.videoUrl)
          : body.youtubeUrl
          ? String(body.youtubeUrl)
          : undefined,
      status:
        String(body.status ?? "publicado") === "rascunho"
          ? "rascunho"
          : "publicado",
    });

    // força atualização das páginas públicas
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao criar" },
      { status: 400 }
    );
  }
}
