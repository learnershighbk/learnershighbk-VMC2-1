import { marked } from 'marked';

export type HeadingItem = {
  level: number;
  id: string;
  text: string;
};

export function buildHeadingIndex(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);

      headings.push({ level, id, text });
    }
  }

  return headings;
}

export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

export function enrichExternalLinks(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a[href^="http"]');

  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return doc.body.innerHTML;
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const renderer = new marked.Renderer();

  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((token) => {
      if ('text' in token) {
        return token.text;
      }
      return '';
    }).join('');
    const id = generateHeadingId(text);
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: true,
  });

  const rawHtml = await marked.parse(markdown);
  return enrichExternalLinks(rawHtml);
}

