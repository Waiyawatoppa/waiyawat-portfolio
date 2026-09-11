"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Dialog shell for the intercepting project route.
 *
 * The previous implementation labelled its close button "Close (ESC)" but had
 * no key handler, no dialog role, no focus management and a bare clickable div
 * for the backdrop. All of that is handled here.
 */
export default function Modal({
  titleId,
  children,
}: {
  titleId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => router.back(), [router]);

  // Restore focus to whatever opened the dialog.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    return () => previouslyFocused.current?.focus?.();
  }, []);

  // Move focus into the dialog on open.
  useEffect(() => {
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
  }, []);

  // Lock background scroll while open.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-modal-open", "");
    return () => {
      document.body.style.overflow = overflow;
      document.body.removeAttribute("data-modal-open");
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${
        expanded ? "p-0" : "p-0 sm:p-4 md:p-10"
      }`}
    >
      <button
        type="button"
        onClick={close}
        className="absolute inset-0 w-full h-full cursor-default"
      >
        <span className="sr-only">Close dialog</span>
      </button>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative bg-white w-full shadow-2xl overflow-hidden flex flex-col ${
          expanded
            ? "h-dvh max-w-none lg:max-w-6xl rounded-none"
            : "h-dvh sm:h-auto sm:max-h-full max-w-4xl rounded-none sm:rounded-3xl"
        }`}
      >
        <div className="px-6 md:px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center space-x-2" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-pressed={expanded}
              className="text-gray-700 hover:text-gray-900 transition text-sm font-bold rounded px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              {expanded ? "Exit focus" : "Focus"}
              <span className="sr-only"> mode</span>
            </button>
            <button
              type="button"
              onClick={close}
              className="text-gray-700 hover:text-gray-900 transition text-sm font-bold rounded px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              Close
              <span className="sr-only"> dialog (or press Escape)</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
