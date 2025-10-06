"use server";

import { createPost, updatePost, type Post } from "@/lib/posts";

type CreateInput = Omit<Post, "id" | "slug" | "status"> & {
  slug?: string;
  status?: "publicado" | "rascunho" | "published" | "draft";
  youtubeUrl?: string;
};
type UpdatePatch = Partial<Post> & {
  status?: "publicado" | "rascunho" | "published" | "draft";
  youtubeUrl?: string;
};

function normStatus(
  s: CreateInput["status"] | UpdatePatch["status"]
): "publicado" | "rascunho" | undefined {
  if (!s) return undefined;
  if (s === "publicado" || s === "rascunho") return s;
  if (s === "published") return "publicado";
  if (s === "draft") return "rascunho";
  return undefined;
}

export async function addPostAction(input: CreateInput) {
  return createPost({
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    date: input.date,
    categories: input.categories ?? [],
    tags: input.tags ?? [],
    coverImage: input.coverImage,
    videoUrl: input.videoUrl ?? input.youtubeUrl ?? undefined,
    status: normStatus(input.status) ?? "publicado",
    author: input.author,
    readingMinutes: input.readingMinutes,
    slug: input.slug,
  });
}

export async function updatePostAction(id: string, patch: UpdatePatch) {
  return updatePost(id, {
    ...patch,
    videoUrl: patch.videoUrl ?? patch.youtubeUrl ?? undefined,
    status: normStatus(patch.status),
  });
}
