import Image from "next/image";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { createIdFactory } from "@/lib/markdown";
import { isAllowedImageSrc, safeExternalUrl, youtubeId } from "@/lib/url";

/**
 * Renders case-study content.
 *
 * react-markdown builds a React element tree rather than injecting HTML, and
 * raw HTML in the source is ignored by default, so stored content cannot
 * introduce script or markup. That is why this is markdown rather than a
 * rich-text editor storing HTML.
 *
 * remark-breaks keeps single newlines as line breaks, so everything written
 * before this existed still renders the way it did as plain text.
 */

function toText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export default function Markdown({ content }: { content: string }) {
  // Must match extractHeadings() so the table of contents anchors resolve.
  const nextId = createIdFactory();

  const components: Components = {
    h1: ({ children }) => (
      <h2
        id={nextId(toText(children))}
        className="font-sans text-[1.55em] md:text-[1.7em] font-bold text-ink mt-12 mb-4 scroll-mt-28"
      >
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2
        id={nextId(toText(children))}
        className="font-sans text-[1.55em] md:text-[1.7em] font-bold text-ink mt-12 mb-4 scroll-mt-28"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        id={nextId(toText(children))}
        className="font-sans text-[1.3em] md:text-[1.4em] font-bold text-ink mt-10 mb-3 scroll-mt-28"
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-sans text-[1.15em] font-bold text-ink mt-8 mb-2">
        {children}
      </h4>
    ),
    p: ({ children }) => {
      // A paragraph that is nothing but a YouTube link becomes an embed. The
      // same URL inside a sentence stays an ordinary link.
      const items = Array.isArray(children) ? children : [children];
      const only = items.filter(
        (item) => !(typeof item === "string" && item.trim() === ""),
      );
      if (only.length === 1) {
        const single = only[0];
        const href =
          typeof single === "string"
            ? single
            : typeof single === "object" &&
                single !== null &&
                "props" in single &&
                typeof (single as { props: { href?: unknown } }).props.href ===
                  "string"
              ? (single as { props: { href: string } }).props.href
              : null;
        const id = href ? youtubeId(href) : null;
        if (id) {
          return (
            <span className="block my-8 aspect-video overflow-hidden rounded-2xl border border-line bg-gray-900">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title="YouTube video"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
              />
            </span>
          );
        }
      }
      return <p className="my-5 leading-loose">{children}</p>;
    },
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
      <ul className="my-5 list-disc pl-6 space-y-2 marker:text-sky-600">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-5 list-decimal pl-6 space-y-2 marker:text-sky-600 marker:font-semibold">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-sky-400 bg-accent-soft pl-6 pr-4 py-3 rounded-r-xl italic text-ink-secondary">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-line" />,
    a: ({ href, children }) => {
      const safe = safeExternalUrl(href);
      if (!safe) return <span>{children}</span>;
      return (
        <a
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans font-medium text-accent-strong underline underline-offset-4 decoration-sky-300 hover:decoration-sky-700 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {children}
        </a>
      );
    },
    code: ({ className, children }) => {
      // Fenced blocks arrive with a language class; inline code does not.
      const isBlock = Boolean(className);
      if (isBlock) {
        return (
          <code className="font-mono text-[0.85em] leading-relaxed">{children}</code>
        );
      }
      return (
        <code className="font-mono text-[0.9em] bg-surface-muted text-pink-800 px-1.5 py-0.5 rounded">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-2xl bg-gray-900 text-gray-100 p-5">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full font-sans text-[0.85em] border-collapse">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-surface-raised">{children}</thead>,
    th: ({ children }) => (
      <th className="text-left font-bold text-ink px-4 py-3 border-b border-line">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 border-b border-line align-top">
        {children}
      </td>
    ),
    img: ({ src, alt }) => {
      const source = typeof src === "string" ? src : "";
      if (!isAllowedImageSrc(source)) return null;
      return (
        <span className="block my-8">
          <Image
            src={source}
            alt={alt ?? ""}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 672px"
            className="w-full h-auto rounded-2xl border border-line"
          />
          {alt && (
            <span className="block mt-2 text-center font-sans text-[0.8em] text-ink-muted">
              {alt}
            </span>
          )}
        </span>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
