import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — Portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at request time and cached, so there is no static asset to keep in
 * sync. Without this, every share on LinkedIn, Slack or Discord rendered as a
 * bare text link.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#334155",
              marginBottom: 32,
            }}
          >
            Portfolio
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#0a0a0a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Bridging Business Strategy with Technology.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 120,
                height: 8,
                borderRadius: 999,
                background: "#0284c7",
              }}
            />
            <div
              style={{
                width: 120,
                height: 8,
                borderRadius: 999,
                background: "#db2777",
              }}
            />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#0a0a0a" }}>
            {site.name}
          </div>
          <div style={{ fontSize: 26, color: "#475569" }}>{site.role}</div>
        </div>
      </div>
    ),
    size,
  );
}
