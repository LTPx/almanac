"use client";

import React from "react";
import { parseMarkdownAndHtml, ParsedContent } from "@/lib/markdown-parser";
import Image from "next/image";

interface FormattedTextDisplayProps {
  text: string | null | undefined;
  className?: string;
}

const renderContent = (
  content: ParsedContent[] | string | undefined,
  isInline: boolean = false
): React.ReactNode => {
  if (!content) {
    return null;
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((item, idx) => (
      <RenderElement key={idx} item={item} isInline={isInline} />
    ));
  }

  return null;
};

const RenderElement: React.FC<{ item: ParsedContent; isInline?: boolean }> = ({
  item,
  isInline = false
}) => {
  switch (item.type) {
    case "paragraph":
      // Si estamos dentro de un párrafo, usar span en lugar de p
      if (isInline) {
        return (
          <span className="text-gray-300">
            {renderContent(item.content, true)}
          </span>
        );
      }
      return (
        <p className="text-gray-300 leading-relaxed whitespace-normal mb-3">
          {renderContent(item.content, true)}
        </p>
      );

    case "heading":
      const headingClasses = {
        1: "text-3xl font-bold",
        2: "text-2xl font-bold",
        3: "text-xl font-bold",
        4: "text-lg font-bold",
        5: "text-base font-bold",
        6: "text-sm font-bold"
      };
      const hClass =
        headingClasses[item.level as keyof typeof headingClasses] ||
        "text-xl font-bold";
      return (
        <div className={`${hClass} text-white my-4 mb-2`}>
          {renderContent(item.content, true)}
        </div>
      );

    case "bold":
      return (
        <strong className="font-bold text-white">
          {renderContent(item.content, true)}
        </strong>
      );

    case "italic":
      return (
        <em className="italic text-gray-200">
          {renderContent(item.content, true)}
        </em>
      );

    case "code":
      return (
        <code className="bg-neutral-800 text-orange-400 px-2 py-1 rounded font-mono text-sm">
          {typeof item.content === "string" ? item.content : ""}
        </code>
      );

    case "codeblock":
      return (
        <div className="bg-neutral-800 rounded-lg overflow-x-auto my-4 border border-neutral-700">
          {item.language && item.language !== "text" && (
            <div className="px-4 py-2 bg-neutral-900 text-gray-400 text-xs font-semibold border-b border-neutral-700">
              {item.language}
            </div>
          )}
          <pre className="p-4 text-sm text-green-400 font-mono overflow-x-auto">
            <code>{typeof item.content === "string" ? item.content : ""}</code>
          </pre>
        </div>
      );

    case "list":
      return (
        <ul className="list-disc list-inside space-y-2 my-3 text-gray-300 ml-2">
          {item.items?.map((listItem, idx) => (
            <li key={idx} className="text-gray-300">
              {listItem}
            </li>
          ))}
        </ul>
      );

    case "orderedlist":
      return (
        <ol className="list-decimal list-inside space-y-2 my-3 text-gray-300 ml-2">
          {item.items?.map((listItem, idx) => (
            <li key={idx} className="text-gray-300">
              {listItem}
            </li>
          ))}
        </ol>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 text-gray-400 italic">
          {renderContent(item.content, true)}
        </blockquote>
      );

    case "link":
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {renderContent(item.content, true)}
        </a>
      );

    case "image":
      return (
        <div className="my-4 rounded-lg overflow-hidden">
          <Image
            src={item.src || ""}
            alt={item.alt || "image"}
            width={500}
            height={300}
            className="w-full h-auto"
          />
        </div>
      );

    case "table":
      const headers = (item.content as string).split(",");
      return (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-neutral-600">
            <thead>
              <tr className="bg-neutral-800">
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="border border-neutral-600 px-4 py-2 text-left font-semibold text-gray-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.rows?.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-neutral-800/50">
                  {row.cells.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="border border-neutral-600 px-4 py-2 text-gray-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return <hr className="my-4 border-neutral-600" />;

    default:
      return null;
  }
};

export const FormattedTextDisplay: React.FC<FormattedTextDisplayProps> = ({
  text,
  className = ""
}) => {
  if (!text || text.trim() === "") {
    return (
      <p className={`text-gray-400 ${className}`}>
        Sin descripción disponible.
      </p>
    );
  }

  const parsed = parseMarkdownAndHtml(text);

  if (parsed.length === 0) {
    return <p className={`text-gray-300 ${className}`}>{text}</p>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {parsed.map((item, idx) => (
        <RenderElement key={idx} item={item} />
      ))}
    </div>
  );
};
