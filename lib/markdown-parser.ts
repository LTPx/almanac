export interface ParsedContent {
  type:
    | "paragraph"
    | "heading"
    | "bold"
    | "italic"
    | "code"
    | "codeblock"
    | "list"
    | "orderedlist"
    | "link"
    | "image"
    | "blockquote"
    | "table"
    | "hr";
  content?: string | ParsedContent[];
  level?: number;
  language?: string;
  items?: string[];
  rows?: Array<{ cells: string[] }>;
  href?: string;
  src?: string;
  alt?: string;
}

export const parseMarkdownAndHtml = (
  text: string | null | undefined
): ParsedContent[] => {
  if (!text) return [];

  let content = text.toString();

  content = content
    .replace(/&#10;/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n");

  const blocks: ParsedContent[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.match(/^#{1,6}\s/)) {
      const match = trimmed.match(/^(#{1,6})\s(.+)$/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length,
          content: parseInlineElements(match[2])
        });
      }
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quote = trimmed.replace(/^>\s?/, "");
      blocks.push({
        type: "blockquote",
        content: parseInlineElements(quote)
      });
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "codeblock",
        language,
        content: codeLines.join("\n")
      });
      i++;
      continue;
    }

    if (trimmed.match(/^(\*|-|_){3,}$/)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (trimmed.match(/^[\*\-\+]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[\*\-\+]\s/)) {
        const item = lines[i].trim().replace(/^[\*\-\+]\s/, "");
        items.push(parseInlineElements(item).toString());
        i++;
      }
      blocks.push({
        type: "list",
        items
      });
      continue;
    }

    if (trimmed.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const item = lines[i].trim().replace(/^\d+\.\s/, "");
        items.push(parseInlineElements(item).toString());
        i++;
      }
      blocks.push({
        type: "orderedlist",
        items
      });
      continue;
    }

    if (
      trimmed.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|[\s\-|:]+\|$/)
    ) {
      const headerRow = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);
      i += 2;
      const rows: Array<{ cells: string[] }> = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        const cells = lines[i]
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        if (cells.length === headerRow.length) {
          rows.push({
            cells: cells.map((cell) => parseInlineElements(cell).toString())
          });
        }
        i++;
      }
      blocks.push({
        type: "table",
        content: headerRow.join(","),
        rows
      });
      continue;
    }

    blocks.push({
      type: "paragraph",
      content: parseInlineElements(trimmed)
    });
    i++;
  }

  return blocks;
};

export const parseInlineElements = (text: string): ParsedContent[] => {
  const elements: ParsedContent[] = [];
  let current = "";
  let i = 0;

  while (i < text.length) {
    if (
      (text[i] === "*" && text[i + 1] === "*") ||
      (text[i] === "_" && text[i + 1] === "_")
    ) {
      if (current) elements.push({ type: "paragraph", content: current });
      const delimiter = text[i];
      i += 2;
      let bold = "";
      while (i < text.length - 1) {
        if (text[i] === delimiter && text[i + 1] === delimiter) {
          elements.push({ type: "bold", content: bold });
          i += 2;
          current = "";
          break;
        }
        bold += text[i];
        i++;
      }
      continue;
    }

    if ((text[i] === "*" || text[i] === "_") && text[i - 1] !== text[i]) {
      if (current) elements.push({ type: "paragraph", content: current });
      const delimiter = text[i];
      i++;
      let italic = "";
      while (i < text.length) {
        if (text[i] === delimiter) {
          elements.push({ type: "italic", content: italic });
          i++;
          current = "";
          break;
        }
        italic += text[i];
        i++;
      }
      continue;
    }

    if (text[i] === "`") {
      if (current) elements.push({ type: "paragraph", content: current });
      i++;
      let code = "";
      while (i < text.length && text[i] !== "`") {
        code += text[i];
        i++;
      }
      if (text[i] === "`") i++;
      elements.push({ type: "code", content: code });
      current = "";
      continue;
    }

    if (text[i] === "[") {
      if (current) elements.push({ type: "paragraph", content: current });
      i++;
      let linkText = "";
      while (i < text.length && text[i] !== "]") {
        linkText += text[i];
        i++;
      }
      if (text[i] === "]" && text[i + 1] === "(") {
        i += 2;
        let href = "";
        while (i < text.length && text[i] !== ")") {
          href += text[i];
          i++;
        }
        if (text[i] === ")") i++;
        elements.push({
          type: "link",
          content: linkText,
          href
        });
        current = "";
        continue;
      }
    }

    if (text[i] === "!" && text[i + 1] === "[") {
      if (current) elements.push({ type: "paragraph", content: current });
      i += 2;
      let alt = "";
      while (i < text.length && text[i] !== "]") {
        alt += text[i];
        i++;
      }
      if (text[i] === "]" && text[i + 1] === "(") {
        i += 2;
        let src = "";
        while (i < text.length && text[i] !== ")") {
          src += text[i];
          i++;
        }
        if (text[i] === ")") i++;
        elements.push({
          type: "image",
          src,
          alt
        });
        current = "";
        continue;
      }
    }

    current += text[i];
    i++;
  }

  if (current) {
    elements.push({ type: "paragraph", content: current });
  }

  return elements;
};
