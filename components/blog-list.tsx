import PostCard, { type PostCardPost } from "@/components/post-card";

export default function BlogList({ posts }: { posts: PostCardPost[] }) {
  if (!posts?.length) return null;

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </section>
  );
}
