import React from 'react';

interface Props {
  content: string;
}

// Minimal Markdown → HTML renderer. Handles the subset used in story guides:
// headings (# ## ###), **bold**, `inline code`, fenced code blocks, [links](url), paragraphs.
// Renders via dangerouslySetInnerHTML after stripping dangerous attributes.
export function SimpleMarkdown({ content }: Props) {
  const html = renderMarkdown(content);
  return (
    <div
      style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderMarkdown(src: string): string {
  const lines = src.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.replace(/```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      out.push(
        `<pre style="background:#f5f5f5;border-radius:4px;padding:10px 12px;overflow-x:auto;font-size:12px;margin:8px 0"><code${lang ? ` class="language-${lang}"` : ''}>${codeLines.join('\n')}</code></pre>`
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    if (h3) { out.push(`<h3 style="font-size:13px;font-weight:700;margin:14px 0 4px">${inline(h3[1])}</h3>`); i++; continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { out.push(`<h2 style="font-size:15px;font-weight:700;margin:18px 0 6px">${inline(h2[1])}</h2>`); i++; continue; }
    const h1 = line.match(/^# (.+)/);
    if (h1) { out.push(`<h1 style="font-size:17px;font-weight:700;margin:0 0 10px">${inline(h1[1])}</h1>`); i++; continue; }

    // Blockquote
    const bq = line.match(/^> (.+)/);
    if (bq) {
      out.push(`<blockquote style="border-left:3px solid #bdbdbd;margin:8px 0;padding:4px 12px;color:#666">${inline(bq[1])}</blockquote>`);
      i++; continue;
    }

    // Unordered list item
    const li = line.match(/^[-*] (.+)/);
    if (li) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] (.+)/)) {
        const m = lines[i].match(/^[-*] (.+)/)!;
        items.push(`<li style="margin:2px 0">${inline(m[1])}</li>`);
        i++;
      }
      out.push(`<ul style="margin:6px 0 6px 18px;padding:0">${items.join('')}</ul>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') { out.push('<br>'); i++; continue; }

    // Paragraph
    out.push(`<p style="margin:4px 0">${inline(line)}</p>`);
    i++;
  }

  return out.join('');
}

function inline(text: string): string {
  return escapeHtml(text)
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // `code`
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;border-radius:3px;padding:1px 4px;font-size:11px">$1</code>')
    // [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1565c0">$1</a>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
