const WORDS_PER_MINUTE = 200;

export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadingMinutes(html: string): number {
  const text = stripHtml(html);
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function autoExcerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
