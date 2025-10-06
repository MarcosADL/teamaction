export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch { return null; }
}

export function getYouTubeThumb(id: string, size: "hq"|"mq"|"sd"="hq") {
  const map = { hq: "hqdefault.jpg", mq: "mqdefault.jpg", sd: "sddefault.jpg" } as const;
  return `https://i.ytimg.com/vi/${id}/${map[size]}`;
}
