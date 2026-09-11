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
    <main id="main" className="bg-white min-h-dvh grid place-items-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-gray-500 mb-4">
          Something went wrong
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          This page hit a snag.
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          It is usually temporary. Try again, or head back to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-sky-700 transition shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-8 py-3 border border-gray-300 rounded-full text-sm font-bold text-gray-900 hover:bg-gray-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
