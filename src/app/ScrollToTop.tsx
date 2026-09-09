"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Hover fills use the lightest shade of each hue that still clears 4.5:1
 * against white at this text size: pink-600 (4.54:1), purple-600 (5.53:1),
 * sky-700 (5.85:1). The original -500 steps measured 3.6-4.1:1.
 */
const SECTIONS = [
  { id: "about", label: "About Me", hover: "hover:bg-pink-600 hover:text-white" },
  { id: "tech-stack", label: "Tech & Skills", hover: "hover:bg-purple-600 hover:text-white" },
  { id: "works", label: "Selected Works", hover: "hover:bg-sky-700 hover:text-white" },
];

const SCROLL_THRESHOLD = 300;
const HEADER_OFFSET = 80;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // The shortcuts target homepage anchors, which do not exist on
  // /project/[slug] or /admin, so the menu is homepage-only.
  const showMenu = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > SCROLL_THRESHOLD;
      setVisible(past);
      if (!past) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouch(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
    }
    setOpen(false);
  }

  // Touch devices have no hover, so the first tap reveals the menu and the
  // second scrolls to top. The button's accessible name follows whichever it
  // is actually about to do, rather than always claiming "scroll to top".
  const tapOpensMenu = showMenu && isTouch && !open;

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3 group"
    >
      {showMenu && (
        <div
          id="section-shortcuts"
          className={`flex flex-col items-end gap-2 transition-all duration-300 ease-out motion-reduce:transition-none ${
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto"
          }`}
        >
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`px-4 py-2 bg-white text-gray-700 text-xs font-bold rounded-full shadow-lg border border-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${section.hover}`}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => (tapOpensMenu ? setOpen(true) : scrollToTop())}
        aria-expanded={showMenu && isTouch ? open : undefined}
        aria-controls={showMenu && isTouch ? "section-shortcuts" : undefined}
        className="p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-sky-600 hover:scale-105 transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
        <span className="sr-only">
          {tapOpensMenu ? "Open section menu" : "Back to top"}
        </span>
      </button>
    </div>
  );
}
