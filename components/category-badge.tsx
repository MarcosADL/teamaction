import Link from "next/link";

const CATEGORY_STYLES: Record<string, string> = {
  "Notícias": "bg-primary/10 text-primary border-primary/30",
  "Tática": "bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-300",
  "Treino": "bg-amber-500/10 text-amber-700 border-amber-400/30 dark:text-amber-300",
  "Lesões": "bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-300",
  "Análise": "bg-sky-500/10 text-sky-700 border-sky-400/30 dark:text-sky-300",
};

function stylesFor(name: string) {
  return CATEGORY_STYLES[name] || "bg-accent/10 text-accent-foreground/90 border-accent/30";
}

export default function CategoryBadge({
  name,
  href,
}: {
  name: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${stylesFor(
        name
      )}`}
    >
      {name}
    </Link>
  );
}
