"use client";

/**
 * Last-resort boundary for failures inside the root layout itself. Must render
 * its own <html> and <body> because the layout did not.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#0a0a0a",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "36rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#4a5565", marginBottom: "2rem" }}>
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "999px",
              border: 0,
              background: "#0a0a0a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
