type Props = {
  id: string;
  title?: string;
};

export default function YouTubeEmbed({ id, title }: Props) {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="aspect-[16/9]">
        <iframe
          className="h-full w-full"
          src={src}
          title={title ?? "YouTube video"}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
