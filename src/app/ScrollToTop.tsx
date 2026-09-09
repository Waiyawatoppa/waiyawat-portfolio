"use client";

import { useEffect, useState } from "react";

/**
 * Simplified to a single scroll-to-top control.
 *
 * It previously doubled as a section menu with different behaviour on touch vs
 * mouse — the first tap opened a menu while the button still announced itself
 * as "Scroll to top", and it linked to homepage anchors that do not exist on
 * the project or admin routes. Section navigation now lives in the header,
 * which works on mobile.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      }}
      className="fixed bottom-6 right-6 z-40 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-sky-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
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
      <span className="sr-only">Back to top</span>
    </button>
  );
}
