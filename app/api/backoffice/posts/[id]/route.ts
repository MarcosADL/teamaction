// app/api/backoffice/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPostById, updatePost, deletePost } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const id = ctx.params.id;
  const found = await getPostById(id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, post: found });
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => ({}));
    const updated = await updatePost(id, body);

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // revalidar páginas
    revalidatePath("/backoffice/posts");
    revalidatePath(`/blog/${updated.slug}`);

    return NextResponse.json({ ok: true, post: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao atualizar" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const id = ctx.params.id;
    await deletePost(id);
    revalidatePath("/backoffice/posts");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha ao apagar" },
      { status: 400 }
    );
  }
}
