// app/backoffice/posts/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import Filters from "./Filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function deletePostAction(id: string) {
  "use server";
  const { deletePost } = await import("@/lib/posts");
  const { revalidatePath } = await import("next/cache");
  await deletePost(id);
  revalidatePath("/backoffice/posts");
}

type SearchParams = { [key: string]: string | string[] | undefined };
type PageProps = { searchParams: Promise<SearchParams> };

const take1 = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v ?? "";

const norm = (s: string) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// aceita published/publicado e draft/rascunho
function parseStatusParam(raw: string): "all" | "published" | "draft" {
  const v = norm(raw).trim();
  if (!v) return "all";
  if (v === "published" || v === "publicado") return "published";
  if (v === "draft" || v === "rascunho") return "draft";
  return "all";
}

// qualquer coisa ≠ 'published' é tratado como draft
function normalizeStatus(s: unknown): "published" | "draft" {
  return s === "published" ? "published" : "draft";
}

export default async function PostsAdminPage({ searchParams }: PageProps) {
  // 👇 searchParams é assíncrono em rotas dinâmicas
  const sp = await searchParams;

  // filtros
  const q = take1(sp.q);
  const statusFilter = parseStatusParam(take1(sp.status));

  // dados
  const posts = await getAllPosts();

  // ordenação por data desc
  const ordered = [...posts].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    return bd - ad;
  });

  // filtro (estado + pesquisa)
  const filtered = ordered.filter((p) => {
    const st = normalizeStatus((p as any).status);

    if (statusFilter === "published" && st !== "published") return false;
    if (statusFilter === "draft" && st !== "draft") return false;

    if (!q) return true;
    const needle = norm(q);
    const hay = norm(
      [
        p.title,
        p.slug,
        p.excerpt,
        p.content,
        p.tags?.join(" "),
        p.categories?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
    );
    return hay.includes(needle);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Posts</h3>
        <Link className="underline" href="/backoffice/posts/new">
          Novo
        </Link>
      </div>

      {/* feedback visual do filtro */}
      <div className="text-sm text-gray-600">
        <span className="mr-3">
          <strong>Estado:</strong>{" "}
          {statusFilter === "all"
            ? "Todos"
            : statusFilter === "published"
            ? "Publicado"
            : "Rascunho"}
        </span>
        {q ? (
          <span>
            <strong>Pesquisa:</strong> {q}
          </span>
        ) : null}
      </div>

      {/* Filtros com auto-submit ao mudar o estado */}
      <Filters
        qDefault={q}
        statusDefault={statusFilter}
        countLabel={`${filtered.length} / ${ordered.length}`}
      />

      <ul className="space-y-2">
        {filtered.map((p) => {
          const st = normalizeStatus((p as any).status);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{p.title}</span>
              <StatusBadge status={st} />
              {p.date ? (
                <span className="text-gray-500 text-sm">
                  — {formatDate(p.date)}
                </span>
              ) : null}

              <span className="ml-2 flex items-center gap-3">
                <Link href={`/backoffice/posts/${p.id}`} className="underline">
                  Editar
                </Link>
                <form action={deletePostAction.bind(null, p.id)} className="inline">
                  <button type="submit" className="text-red-600 hover:underline">
                    Remover
                  </button>
                </form>
              </span>

              {p.excerpt ? (
                <p className="w-full text-gray-600 text-sm mt-0.5">{p.excerpt}</p>
              ) : null}
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="text-gray-500">
            Sem resultados para os filtros aplicados.
          </li>
        )}
      </ul>
    </div>
  );
}

function formatDate(input: string) {
  try {
    return new Date(input).toLocaleDateString("pt-PT");
  } catch {
    return "";
  }
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const cls =
    status === "published"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  const label = status === "published" ? "Publicado" : "Rascunho";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
