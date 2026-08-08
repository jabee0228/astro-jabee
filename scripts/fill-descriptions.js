import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NOTES_DIR = path.resolve(__dirname, '../src/content/notes');

export function extractCleanText(body, maxLength = 150) {
  if (!body) return '';

  let text = body;
  // 1. Strip import/export statements in MDX
  text = text.replace(/^import\s+.*$/gm, '');
  text = text.replace(/^export\s+.*$/gm, '');

  // 2. Strip hugo-like shortcodes e.g. {{< ... >}} or {{ ... }}
  text = text.replace(/\{\{[\s\S]*?\}\}/g, '');

  // 3. Strip MDX/JSX components & HTML tags (e.g. <YouTube ... />, <Image ... />, <div>, etc.)
  text = text.replace(/<[^>]+>/g, '');

  // 4. Strip code blocks ``` ... ```
  text = text.replace(/```[\s\S]*?```/g, '');

  // 5. Strip inline code `...`
  text = text.replace(/`([^`]+)`/g, '$1');

  // 6. Strip images ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 7. Replace markdown links [text](url) with just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 8. Strip headings (#, ##, etc.)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 9. Strip blockquotes (>), horizontal rules (---, ***, ___), and list markers (-, *, +, 1., etc.)
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  text = text.replace(/^[\*\-+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 10. Strip markdown emphasis / formatting (*, **, _, __, ~~)
  text = text.replace(/[*_~]{1,3}/g, '');

  // 11. Strip HTML comments <!-- ... -->
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 12. Normalize whitespaces & newlines
  text = text.replace(/\s+/g, ' ').trim();

  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Match frontmatter between --- and ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
  if (!match) return;

  const frontmatter = match[1];
  const body = match[2];

  // Check if description already exists and is non-empty
  const descMatch = frontmatter.match(/^description:\s*(.*)$/m);
  if (descMatch) {
    const val = descMatch[1].trim();
    // If it's a non-empty description (not just "" or ''), skip
    if (val && val !== '""' && val !== "''" && val !== 'null') {
      return;
    }
  }

  const generatedDesc = extractCleanText(body);
  if (!generatedDesc) return;

  const safeDescString = JSON.stringify(generatedDesc);
  let newFrontmatter = frontmatter;

  if (descMatch) {
    // Replace empty description
    newFrontmatter = frontmatter.replace(/^description:\s*.*$/m, `description: ${safeDescString}`);
  } else {
    // Insert description right after title: if present, else before the end of frontmatter
    if (/^title:\s*.*$/m.test(frontmatter)) {
      newFrontmatter = frontmatter.replace(/^(title:\s*.*)$/m, `$1\ndescription: ${safeDescString}`);
    } else {
      newFrontmatter = `${frontmatter.trimEnd()}\ndescription: ${safeDescString}\n`;
    }
  }

  const newContent = `---\n${newFrontmatter.trim()}\n---${body}`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`[fill-descriptions] Updated: ${path.relative(process.cwd(), filePath)}`);
}

export function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      processFile(fullPath);
    }
  }
}

export function fillAllDescriptions() {
  walkDir(NOTES_DIR);
}

// If executed directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log('[fill-descriptions] Checking for missing descriptions in notes...');
  fillAllDescriptions();
  console.log('[fill-descriptions] Done.');
}
