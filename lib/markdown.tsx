import type { ReactNode } from "react";

/**
 * Tiny markdown renderer for news bodies. No dependencies, no
 * dangerouslySetInnerHTML: everything is emitted as React elements, so the
 * source text is always escaped by React.
 *
 * Supported: paragraphs (blank-line separated), # / ## / ### headings,
 * "- " bullet lists, **bold**, *italic*, `code`, [text](https://link).
 */

const INLINE_RE =
  /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    if (m[1]) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{m[2]}</strong>);
    } else if (m[3]) {
      nodes.push(<em key={`${keyPrefix}-i${i}`}>{m[4]}</em>);
    } else if (m[5]) {
      nodes.push(<code key={`${keyPrefix}-c${i}`}>{m[6]}</code>);
    } else if (m[7]) {
      nodes.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={m[9]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m[8]}
        </a>
      );
    }
    last = idx + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(md: string): ReactNode[] {
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const out: ReactNode[] = [];

  blocks.forEach((rawBlock, bi) => {
    const block = rawBlock.trim();
    if (!block) return;

    const lines = block.split("\n").map((l) => l.trim());

    // Bullet list block
    if (lines.every((l) => l.startsWith("- "))) {
      out.push(
        <ul key={`b${bi}`}>
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.slice(2), `b${bi}-l${li}`)}</li>
          ))}
        </ul>
      );
      return;
    }

    // Heading block (single line)
    const heading = /^(#{1,3})\s+(.*)$/.exec(block);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      const content = renderInline(heading[2], `b${bi}`);
      if (level === 1) out.push(<h3 key={`b${bi}`}>{content}</h3>);
      else if (level === 2) out.push(<h4 key={`b${bi}`}>{content}</h4>);
      else out.push(<h5 key={`b${bi}`}>{content}</h5>);
      return;
    }

    // Paragraph (single newlines become spaces)
    out.push(<p key={`b${bi}`}>{renderInline(lines.join(" "), `b${bi}`)}</p>);
  });

  return out;
}
