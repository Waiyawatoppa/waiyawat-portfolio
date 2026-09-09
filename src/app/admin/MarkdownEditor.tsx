"use client";

import { useRef, useState, type ReactNode } from "react";

import Markdown from "../_components/Markdown";
import { uploadContentImage } from "./actions";

type Selection = { next: string; start: number; end: number };

/** Wrap the selection, e.g. **bold**. */
function surround(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
): Selection {
  const selected = value.slice(start, end);
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  return {
    next,
    start: start + before.length,
    end: start + before.length + selected.length,
  };
}

/** Prefix every line the selection touches, e.g. "## " or "- ". */
function prefixLines(
  value: string,
  start: number,
  end: number,
  prefix: string | ((line: string, index: number) => string),
): Selection {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const afterEnd = value.indexOf("\n", end);
  const lineEnd = afterEnd === -1 ? value.length : afterEnd;

  const block = value.slice(lineStart, lineEnd) || "";
  const prefixed = block
    .split("\n")
    .map((line, index) =>
      typeof prefix === "function" ? prefix(line, index) : `${prefix}${line}`,
    )
    .join("\n");

  return {
    next: `${value.slice(0, lineStart)}${prefixed}${value.slice(lineEnd)}`,
    start: lineStart,
    end: lineStart + prefixed.length,
  };
}

function BarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="h-8 min-w-8 px-2 grid place-items-center rounded-lg text-sm text-gray-800 hover:bg-white hover:shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <span aria-hidden="true" className="w-px h-5 bg-gray-300 mx-1" />
);

export default function MarkdownEditor({
  name,
  defaultValue = "",
  rows = 18,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Apply an edit and put the caret back where the writer expects it. */
  function apply(transform: (value: string, start: number, end: number) => Selection) {
    const area = areaRef.current;
    if (!area) return;

    const { selectionStart, selectionEnd } = area;
    const result = transform(value, selectionStart, selectionEnd);
    setValue(result.next);

    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(result.start, result.end);
    });
  }

  const wrap = (before: string, after = before) =>
    apply((v, s, e) => surround(v, s, e, before, after));

  const lead = (prefix: string | ((line: string, index: number) => string)) =>
    apply((v, s, e) => prefixLines(v, s, e, prefix));

  function insertBlock(text: string) {
    apply((v, s, e) => {
      const needsLeading = s > 0 && v[s - 1] !== "\n";
      const body = `${needsLeading ? "\n" : ""}${text}\n`;
      return {
        next: `${v.slice(0, s)}${body}${v.slice(e)}`,
        start: s + body.length,
        end: s + body.length,
      };
    });
  }

  async function onPickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadContentImage(formData);

      if (!result.ok) {
        setError(result.message);
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, "");
      insertBlock(`![${alt}](${result.url})`);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrap("**");
    } else if (key === "i") {
      event.preventDefault();
      wrap("*");
    } else if (key === "k") {
      event.preventDefault();
      wrap("[", "](https://)");
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-2">
        <BarButton onClick={() => wrap("**")} title="Bold (Ctrl+B)">
          <span className="font-black">B</span>
        </BarButton>
        <BarButton onClick={() => wrap("*")} title="Italic (Ctrl+I)">
          <span className="italic font-serif">I</span>
        </BarButton>

        <Divider />

        <BarButton onClick={() => lead("## ")} title="Heading 2">
          <span className="font-bold">H2</span>
        </BarButton>
        <BarButton onClick={() => lead("### ")} title="Heading 3">
          <span className="font-bold">H3</span>
        </BarButton>

        <Divider />

        <BarButton onClick={() => lead("- ")} title="Bulleted list">
          <span aria-hidden="true">•—</span>
        </BarButton>
        <BarButton
          onClick={() => lead((line, index) => `${index + 1}. ${line}`)}
          title="Numbered list"
        >
          <span aria-hidden="true">1.</span>
        </BarButton>
        <BarButton onClick={() => lead("> ")} title="Quote">
          <span aria-hidden="true">&ldquo;</span>
        </BarButton>

        <Divider />

        <BarButton onClick={() => wrap("`")} title="Inline code">
          <span className="font-mono text-xs">{"</>"}</span>
        </BarButton>
        <BarButton
          onClick={() => wrap("```\n", "\n```")}
          title="Code block"
        >
          <span className="font-mono text-xs">{"{ }"}</span>
        </BarButton>
        <BarButton onClick={() => wrap("[", "](https://)")} title="Link (Ctrl+K)">
          <span aria-hidden="true">🔗</span>
        </BarButton>
        <BarButton onClick={() => insertBlock("---")} title="Divider">
          <span aria-hidden="true">―</span>
        </BarButton>

        <Divider />

        <BarButton
          onClick={() => fileRef.current?.click()}
          title="Insert image"
        >
          <span aria-hidden="true">{uploading ? "…" : "🖼"}</span>
        </BarButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          onChange={onPickImage}
          className="hidden"
        />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreview(false)}
            aria-pressed={!preview}
            className={`px-3 h-8 rounded-lg text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
              preview ? "text-gray-700 hover:bg-white" : "bg-gray-900 text-white"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            aria-pressed={preview}
            className={`px-3 h-8 rounded-lg text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
              preview ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-white"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Always mounted so its value is submitted with the form, even while the
          preview tab is showing. */}
      <textarea
        ref={areaRef}
        id={name}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        required
        maxLength={50000}
        spellCheck
        className={`w-full p-4 font-mono text-sm leading-relaxed outline-none resize-y focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 ${
          preview ? "hidden" : "block"
        }`}
      />

      {preview && (
        <div className="p-6 font-serif text-gray-700 break-words min-h-40">
          {value.trim() ? (
            <Markdown content={value} />
          ) : (
            <p className="text-gray-500 italic font-sans text-sm">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2">
        <p className="text-xs text-gray-600">
          Markdown supported. Select text, then use the toolbar.
        </p>
        <p className="text-xs text-gray-600 tabular-nums">
          {value.length.toLocaleString()} / 50,000
        </p>
      </div>

      {error && (
        <p role="alert" className="px-4 py-2 text-sm text-red-800 bg-red-50">
          {error}
        </p>
      )}
    </div>
  );
}
