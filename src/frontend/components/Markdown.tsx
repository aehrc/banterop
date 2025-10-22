import React from 'react';
import { marked } from 'marked';

// Keep options minimal for broad version compatibility
try { marked.setOptions({ gfm: true, breaks: true } as any); } catch {}

function ensureLinksOpenInNewTab(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = doc.querySelectorAll('a[href]');
    anchors.forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    return doc.body.innerHTML;
  } catch {
    try { return html.replaceAll('<a ', '<a target="_blank" rel="noopener noreferrer" '); } catch { return html; }
  }
}

export function Markdown({ text, className }:{ text?: string; className?: string }) {
  const html = React.useMemo(() => {
    // Convert literal \n escape sequences to actual newlines before parsing.
    const normalized = String(text ?? '').replace(/\\n/g, '\n');

    try {
      const raw = marked.parse(normalized) as string;
      return ensureLinksOpenInNewTab(raw);
    } catch {
      // Fallback: escape HTML and preserve newlines.
      return normalized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    }
  }, [text]);
  return <div className={className || 'markdown'} dangerouslySetInnerHTML={{ __html: html }} />;
}
