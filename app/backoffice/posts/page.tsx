// app/backoffice/posts/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import Filters from "./Filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// continua a existir (é usada no <form action=.../>)
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

// qualquer coisa ≠ 'published' é tratado como draft (compat com 'publicado')
function normalizeStatus(s: unknown): "published" | "draft" {
  const v = String(s ?? "").toLowerCase();
  return v === "published" || v === "publicado" ? "published" : "draft";
}

type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string | null;
  coverImage: string | null;
  status: string; // published|draft (ou 'publicado' legado)
};

async function getAdminPosts(): Promise<AdminPost[]> {
  // construir base URL robusta para produção/preview/local
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/backoffice/posts`, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Falhou a listar posts: ${res.status} ${txt}`);
  }
  const data = (await res.json()) as { ok: boolean; items: AdminPost[] };
  return data.items ?? [];
}

export default async function PostsAdminPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // filtros
  const q = take1(sp.q);
  const statusFilter = parseStatusParam(take1(sp.status));

  // dados (via API interna REST)
  const posts = await getAdminPosts();

  // ordenação por data desc (fallback null -> fim)
  const ordered = [...posts].sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : -Infinity;
    const bd = b.date ? new Date(b.date).getTime() : -Infinity;
    return bd - ad;
    // se ambas null, mantém ordem
  });

  // filtro (estado + pesquisa)
  const filtered = ordered.filter((p) => {
    const st = normalizeStatus(p.status);

    if (statusFilter === "published" && st !== "published") return false;
    if (statusFilter === "draft" && st !== "draft") return false;

    if (!q) return true;
    const needle = norm(q);
    const hay = norm(
      [
        p.title,
        p.slug,
        p.excerpt ?? "",
        // sem content aqui (não vem neste GET; é BO list)
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
          const st = normalizeStatus(p.status);
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{p.title}</span>
              <StatusBadge status={st} />
              {p.date ? (
                <span className="text-gray-500 text-sm">— {formatDate(p.date)}</span>
              ) : null}

              <span className="ml-2 flex items-center gap-3">
                {/* se já tiveres a página de edição */}
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
          <li className="text-gray-500">Sem resultados para os filtros aplicados.</li>
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
