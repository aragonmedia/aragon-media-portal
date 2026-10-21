/**
 * Turn plain-text URLs inside a message body into clickable <a> tags.
 * Opens in a new tab with noopener/noreferrer for safety. Preserves
 * line breaks and plain text between URLs.
 *
 * Example:
 *   "You can use this link to do so:\nhttps://square.link/u/o2grwt7M"
 *   → "You can use this link to do so:\n<a>https://square.link/u/o2grwt7M</a>"
 */

import type { ReactNode } from "react";

// Matches http:// and https:// URLs. Permissive on the path (anything
// except whitespace or trailing punctuation that's likely sentence terminator).
const URL_RE = /\bhttps?:\/\/[^\s<>()]+[^\s<>()\.,;:!?)]/gi;

export function linkify(text: string | null | undefined): ReactNode[] {
  if (!text) return [];
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <a
        key={`url-${start}`}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="msg-link"
      >
        {match[0]}
      </a>
    );
    lastIndex = end;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
