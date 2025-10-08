export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPostById, updatePost, deletePost } from "@/lib/posts";
import { pool } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const found = await getPostById(id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const updated = await updatePost(id, {
      title: body.title ?? undefined,
      slug: body.slug ?? undefined,
      excerpt: body.excerpt ?? undefined,
      content: body.content ?? undefined,
      date: body.date ?? undefined,
      categories: Array.isArray(body.categories) ? body.categories : undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      coverImage: body.coverImage ?? undefined,
      videoUrl:
        body.videoUrl
          ? String(body.videoUrl)
          : body.youtubeUrl
          ? String(body.youtubeUrl)
          : undefined,
      status:
        body.status === "rascunho" || body.status === "publicado"
          ? body.status
          : undefined,
    });

    // revalida lista e página do slug (em caso de mudança de slug, revalida os dois)
    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);

    return NextResponse.json({ ok: true, post: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao atualizar" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const found = await getPostById(id);
  await deletePost(id);

  // se soubermos o slug apagado, revalidamos a página dele e a lista
  revalidatePath("/blog");
  if (found?.slug) revalidatePath(`/blog/${found.slug}`);

  return NextResponse.json({ ok: true });
}
