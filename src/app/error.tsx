"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Shows a recoverable page instead of Next's
 * default screen and never exposes the stack to visitors.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in Vercel's function logs; nothing sensitive reaches the DOM.
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main" className="bg-surface min-h-dvh grid place-items-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-ink-muted mb-4">
          Something went wrong
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6 leading-tight">
          This page hit a snag.
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed mb-10">
          It is usually temporary. Try again, or head back to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="px-8 py-3 bg-ink text-surface rounded-full text-sm font-bold hover:bg-sky-700 transition shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-8 py-3 border border-line-strong rounded-full text-sm font-bold text-ink hover:bg-surface-raised transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
