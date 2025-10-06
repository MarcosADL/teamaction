import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAllPosts, updatePost, type Post } from "@/lib/posts";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/i;
const IMG_RE = /\.(avif|jpe?g|png|webp|gif|svg)$/i;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const all: Post[] = await getAllPosts();
  const post = all.find((p) => p.id === id);
  if (!post) return notFound();

  async function updatePostAction(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const slugRaw = String(formData.get("slug") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    let coverImage = String(formData.get("coverImage") ?? "").trim() || undefined;
    let videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
    const status =
      (String(formData.get("status") ?? "publicado") === "rascunho"
        ? "rascunho"
        : "publicado") as "publicado" | "rascunho";

    const categories = String(formData.get("categories") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = String(formData.get("tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // validação leve
    if (!title || !content) {
      throw new Error("Título e conteúdo são obrigatórios.");
    }
    if (date && !DATE_RE.test(date)) {
      throw new Error("Data inválida. Usa o formato YYYY-MM-DD.");
    }
    if (coverImage && !(IMG_RE.test(coverImage) || coverImage.startsWith("/"))) {
      coverImage = undefined; // normaliza se inválida
    }

    const updated = await updatePost(id, {
      title,
      slug: slugRaw || undefined,
      excerpt: excerpt || undefined,
      content,
      date: date || undefined,
      coverImage,
      videoUrl,
      status,
      categories,
      tags,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    redirect("/backoffice");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Editar Post</h1>

      <form action={updatePostAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Título</label>
          <input name="title" defaultValue={post.title} className="w-full rounded-md border px-3 py-2" required />
        </div>

        <div>
          <label className="mb-1 block text-sm">Slug (opcional)</label>
          <input name="slug" defaultValue={post.slug} className="w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm">Resumo</label>
          <textarea name="excerpt" defaultValue={post.excerpt ?? ""} className="h-20 w-full rounded-md border px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm">Conteúdo</label>
          <textarea name="content" defaultValue={post.content} className="h-40 w-full rounded-md border px-3 py-2" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Data (YYYY-MM-DD)</label>
            <input name="date" defaultValue={post.date ?? ""} className="w-full rounded-md border px-3 py-2" pattern="\d{4}-\d{2}-\d{2}" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Imagem de capa (URL)</label>
            <input name="coverImage" defaultValue={post.coverImage ?? ""} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Link do vídeo (YouTube)</label>
          <input
            name="videoUrl"
            defaultValue={(post as any).videoUrl ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="https://youtu.be/xxxxx ou https://www.youtube.com/watch?v=xxxxx"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Categorias (separadas por ,)</label>
            <input name="categories" defaultValue={(post.categories ?? []).join(", ")} className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Tags (separadas por ,)</label>
            <input name="tags" defaultValue={(post.tags ?? []).join(", ")} className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Estado</label>
          <select name="status" defaultValue={post.status ?? "publicado"} className="rounded-md border px-2 py-2">
            <option value="publicado">Publicado</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md border px-4 py-2 hover:bg-muted/40">
            Guardar alterações
          </button>
          <a href="/backoffice" className="text-sm underline">Cancelar</a>
        </div>
      </form>
    </main>
  );
}
