/**
 * Extracts or falls back to generating a clean description from post content
 */
export function getPostDescription(
  post: { data?: { description?: string }; body?: string },
  maxLength: number = 150
): string {
  const desc = post.data?.description?.trim();
  if (desc) {
    return desc;
  }

  if (!post.body) {
    return '';
  }

  let text = post.body;

  // 1. Strip import/export statements in MDX (e.g. import ... from '...')
  text = text.replace(/^import\s+.*$/gm, '');
  text = text.replace(/^export\s+.*$/gm, '');

  // 2. Strip MDX/JSX components & HTML tags (e.g. <YouTube ... />, <Image ... />, <div>, etc.)
  text = text.replace(/<[^>]+>/g, '');

  // 3. Strip code blocks ``` ... ```
  text = text.replace(/```[\s\S]*?```/g, '');

  // 4. Strip inline code `...`
  text = text.replace(/`([^`]+)`/g, '$1');

  // 5. Strip images ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 6. Replace markdown links [text](url) with just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 7. Strip headings (#, ##, etc.)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 8. Strip blockquotes (>), horizontal rules (---, ***, ___), and list markers (-, *, +, 1., etc.)
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  text = text.replace(/^[\*\-+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 9. Strip markdown emphasis / formatting (*, **, _, __, ~~)
  text = text.replace(/[*_~]{1,3}/g, '');

  // 10. Strip HTML comments <!-- ... -->
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 11. Normalize whitespaces & newlines
  text = text.replace(/\s+/g, ' ').trim();

  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trim() + '...';
}
