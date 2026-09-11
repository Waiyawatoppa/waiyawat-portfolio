"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { Heading } from "@/lib/markdown";

const SIZES = [16, 18, 20, 23] as const;
const DEFAULT_SIZE_INDEX = 1;
const STORAGE_KEY = "reading-font-size";
const MIN_HEADINGS_FOR_TOC = 3;

/**
 * Finds the element that actually scrolls this content. In the modal that is
 * the dialog's overflow container; on the full project page it is the window.
 */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * localStorage is external state. Reads go through useSyncExternalStore so the
 * value is not copied into React state inside an effect, and writes notify
 * subscribers explicitly because the storage event does not fire in the tab
 * that made the change.
 */
const sizeListeners = new Set<() => void>();

function emitSizeChange() {
  sizeListeners.forEach((listener) => listener());
}

function subscribeToSize(onChange: () => void) {
  sizeListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    sizeListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStoredSize(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseSizeIndex(stored: string | null): number {
  if (stored === null) return DEFAULT_SIZE_INDEX;
  const index = Number(stored);
  return Number.isInteger(index) && index >= 0 && index < SIZES.length
    ? index
    : DEFAULT_SIZE_INDEX;
}

/**
 * Reading chrome around the server-rendered article: font size, contents and a
 * progress bar. The article itself stays server-rendered so it is present in
 * the HTML for crawlers; this only wraps it.
 */
/**
 * Layout contract: `children` is the <article> itself. The chrome rendered
 * here (progress, size controls, contents) sits *beside* it, never inside, so
 * browser Reader Mode extracts the article without the controls' text.
 */
export default function ReadingPane({
  headings,
  children,
  stickyTop = "top-0",
}: {
  headings: Heading[];
  children: ReactNode;
  /** Tailwind top-* class for the sticky progress bar (clears a fixed header). */
  stickyTop?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const showToc = headings.length >= MIN_HEADINGS_FOR_TOC;

  // The stored preference is external state, so it is read through
  // useSyncExternalStore rather than copied into React state inside an effect.
  // The server snapshot is null, so the first paint uses the default size and
  // the stored value applies once hydrated.
  const storedSize = useSyncExternalStore(
    subscribeToSize,
    readStoredSize,
    () => null,
  );
  const sizeIndex = parseSizeIndex(storedSize);

  const changeSize = useCallback((next: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* preference simply will not persist */
    }
    emitSizeChange();
  }, []);

  // Progress through the article, measured on whichever container scrolls.
  useEffect(() => {
    const scroller = getScrollParent(rootRef.current);

    const read = () => {
      const root = rootRef.current;
      if (!root) return;

      if (scroller) {
        const max = scroller.scrollHeight - scroller.clientHeight;
        setProgress(max > 0 ? Math.min(1, scroller.scrollTop / max) : 0);
        return;
      }

      const start = root.offsetTop;
      const distance = root.offsetHeight - window.innerHeight;
      const travelled = window.scrollY - start;
      setProgress(
        distance > 0 ? Math.min(1, Math.max(0, travelled / distance)) : 0,
      );
    };

    read();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      target.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  // Highlight the heading currently at the top of the reading area.
  useEffect(() => {
    if (!showToc) return;
    const root = rootRef.current;
    if (!root) return;

    const targets = headings
      .map((heading) => root.querySelector(`#${CSS.escape(heading.id)}`))
      .filter((element): element is Element => element !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [headings, showToc]);

  function goTo(id: string) {
    const target = rootRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    setTocOpen(false);
  }

  const atMin = sizeIndex === 0;
  const atMax = sizeIndex === SIZES.length - 1;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`reading-chrome sticky ${stickyTop} z-20 h-1 bg-surface-muted`}
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-pink-400 transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="reading-chrome flex flex-wrap items-center justify-between gap-3 py-4 px-6 md:px-0 font-sans">
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted mr-2">
            Text size
          </span>
          <button
            type="button"
            onClick={() => changeSize(sizeIndex - 1)}
            disabled={atMin}
            aria-label="Decrease text size"
            className="w-8 h-8 grid place-items-center rounded-lg border border-line-strong text-ink-secondary font-bold hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true" className="text-xs">
              A
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeSize(sizeIndex + 1)}
            disabled={atMax}
            aria-label="Increase text size"
            className="w-8 h-8 grid place-items-center rounded-lg border border-line-strong text-ink-secondary font-bold hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true" className="text-base">
              A
            </span>
          </button>
          <output className="sr-only" aria-live="polite">
            Text size {sizeIndex + 1} of {SIZES.length}
          </output>
        </div>

        {showToc && (
          <button
            type="button"
            onClick={() => setTocOpen((prev) => !prev)}
            aria-expanded={tocOpen}
            aria-controls="reading-toc"
            className="text-xs font-bold uppercase tracking-widest text-ink-secondary hover:text-accent-strong underline underline-offset-4 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {tocOpen ? "Hide contents" : "Contents"}
          </button>
        )}
      </div>

      {showToc && tocOpen && (
        <nav
          id="reading-toc"
          aria-label="Table of contents"
          className="reading-chrome mb-8 mx-6 md:mx-0 rounded-2xl border border-line bg-surface-raised p-5 font-sans"
        >
          <ul className="space-y-1 list-none p-0">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={heading.level === 3 ? "pl-4" : undefined}
              >
                <button
                  type="button"
                  onClick={() => goTo(heading.id)}
                  aria-current={activeId === heading.id ? "location" : undefined}
                  className={`text-left w-full rounded px-2 py-1 text-sm transition-colors hover:bg-surface hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    activeId === heading.id
                      ? "text-accent-strong font-bold"
                      : "text-ink-secondary"
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div style={{ fontSize: `${SIZES[sizeIndex]}px` }}>{children}</div>
    </div>
  );
}
