// lib/utils.ts

/** Data PT-PT dd/mm/aaaa */
export function formatDate(iso?: string, locale = "pt-PT"): string {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Junta classes (evita condicionais espalhadas) */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** alias (se algum sítio usar cx) */
export const cx = cn;
