import { JSX } from "react";

/**
 * Renders markdown-style links and bold text as JSX elements.
 * Handles:
 * - Bold links: **[text](url)**
 * - Simple links: [text](url)
 * - Bold text: **text**
 */
export function renderMessageWithLinks(content: string): (string | JSX.Element)[] | string {
  // Regex to match:
  // 1. Bold links: **[text](url)**
  // 2. Simple links: [text](url)
  // 3. Bold text: **text**
  const markdownRegex = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = markdownRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Bold link: **[text](url)** - groups 1 and 2
    if (match[1] && match[2]) {
      parts.push(
        <a
          key={`bold-link-${keyCounter++}`}
          href={match[2]}
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300 font-bold"
        >
          {match[1]}
        </a>
      );
    }
    // Simple link: [text](url) - groups 3 and 4
    else if (match[3] && match[4]) {
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={match[4]}
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {match[3]}
        </a>
      );
    }
    // Bold text: **text** - group 5
    else if (match[5]) {
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-bold">
          {match[5]}
        </strong>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}
