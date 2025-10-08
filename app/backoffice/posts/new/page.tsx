// app/backoffice/posts/new/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/i;
const IMG_RE = /\.(avif|jpe?g|png|webp|gif|svg)$/i;

function isHttpUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'publicado' | 'rascunho'>('publicado');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Obrigatório.';
    if (!content.trim()) e.content = 'Obrigatório.';
    if (date && !DATE_RE.test(date)) e.date = 'Formato: YYYY-MM-DD.';
    if (
      coverImage &&
      !(IMG_RE.test(coverImage) || coverImage.startsWith('/') || isHttpUrl(coverImage))
    )
      e.coverImage = 'URL de imagem (.png, .jpg, .webp, .svg…) ou caminho /local.';
    if (videoUrl && !isHttpUrl(videoUrl)) e.videoUrl = 'URL inválido.';
    return e;
  }, [title, content, date, coverImage, videoUrl]);

  const disabled = loading || Object.keys(errors).length > 0;

  const toArray = (s: string) =>
    String(s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setErr('');
    setLoading(true);

    try {
      // ⚠️ estes nomes batem certo com lib/posts.ts → createPost()
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        date: date || undefined,             // YYYY-MM-DD
        coverImage: coverImage || undefined, // <= nome que o createPost usa
        videoUrl: videoUrl || undefined,
        categories: toArray(categories),
        tags: toArray(tags),
        status,                              // 'publicado' | 'rascunho'
      };

      // ⚠️ rota do backoffice (JSON file storage), não a rota da BD
      const res = await fetch('/api/backoffice/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.error) {
        throw new Error(json?.error || `Falhou a criação (${res.status})`);
      }

      router.replace('/backoffice/posts');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Novo Post</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Título</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            required
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm">Resumo</label>
          <textarea
            className="h-20 w-full rounded-md border px-3 py-2"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Conteúdo</label>
          <textarea
            className="h-40 w-full rounded-md border px-3 py-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-invalid={!!errors.content}
            required
          />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Data (YYYY-MM-DD)</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="2025-10-10"
              aria-invalid={!!errors.date}
            />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm">Imagem de capa (URL)</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/og/post-og.svg ou https://…"
              aria-invalid={!!errors.coverImage}
            />
            {errors.coverImage && <p className="mt-1 text-xs text-red-600">{errors.coverImage}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Link do vídeo (YouTube)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/xxxxx ou https://www.youtube.com/watch?v=xxxxx"
            aria-invalid={!!errors.videoUrl}
          />
          {errors.videoUrl && <p className="mt-1 text-xs text-red-600">{errors.videoUrl}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Categorias (separadas por ,)</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Tags (separadas por ,)</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Estado</label>
          <select
            className="rounded-md border px-2 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'publicado' | 'rascunho')}
          >
            <option value="publicado">Publicado</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={disabled}
          className="rounded-md border px-4 py-2 hover:bg-muted/40 disabled:opacity-60"
        >
          {loading ? 'A guardar…' : 'Guardar'}
        </button>
      </form>
    </main>
  );
}
