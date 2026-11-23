// Load every post's Markdown as a raw string at build time (Vite glob import).
const bodies = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Returns the raw Markdown body for a post slug, or undefined if missing. */
export function getPostBody(slug: string): string | undefined {
  const match = Object.entries(bodies).find(([path]) => path.endsWith(`/${slug}.md`));
  return match?.[1];
}
