"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { site } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";

export type NavLink = { href: string; label: string };

const LINK_CLASS =
  "hover:text-accent transition rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Site navigation. Previously the links were `hidden md:flex` with no
 * hamburger, so below 768px the site had no navigation at all.
 *
 * Deliberately session-free: sign-in lives at /admin/login so that no page
 * rendering this nav is forced to become dynamic.
 */
export default function SiteNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="fixed w-full z-40 bg-surface/90 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight uppercase shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Waiya<span className="text-accent">wat.</span>
          <span className="sr-only"> — home</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm font-medium text-ink-secondary list-none p-0">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {site.cv && (
                <li>
                  <a
                    href={site.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ink text-surface px-4 py-2 rounded-full text-xs font-bold hover:bg-sky-700 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    CV
                    <span className="sr-only"> (PDF, opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <ThemeToggle />

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="md:hidden p-2 -mr-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="sr-only">
              {open ? "Close menu" : "Open menu"}
            </span>
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="md:hidden border-t border-line bg-surface"
        >
          <nav aria-label="Main">
            <ul className="flex flex-col p-4 gap-1 list-none">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-xl text-base font-medium text-ink hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {site.cv && (
                <li>
                  <a
                    href={site.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-xl text-base font-bold text-accent-strong hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Download CV
                    <span className="sr-only"> (PDF, opens in a new tab)</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
