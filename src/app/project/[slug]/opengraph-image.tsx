import { ImageResponse } from "next/og";

import { getProjectBySlug } from "@/lib/projects";
import { site } from "@/lib/site";
import { isAllowedImageSrc } from "@/lib/url";

export const alt = "Project cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card for a single project.
 *
 * File-based metadata takes precedence over generateMetadata's images, so this
 * route is responsible for the cover as well: when one exists it becomes the
 * background with the title over a bottom gradient; otherwise a branded card.
 * A cover that fails to fetch falls back rather than breaking the share.
 */
async function coverAsDataUrl(url: string): Promise<string | null> {
  if (!isAllowedImageSrc(url)) return null;
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/") || type.includes("svg")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > 8 * 1024 * 1024) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function ProjectOpenGraphImage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  const title = project?.title ?? site.name;
  const category = project?.category ?? "Portfolio";
  const cover = project?.cover_url ? await coverAsDataUrl(project.cover_url) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: cover
            ? "#0a0a0a"
            : "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #fce7f3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {cover && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 45%, rgba(10,10,10,0) 100%)",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            padding: "64px 72px",
            gap: 20,
            color: cover ? "#ffffff" : "#0a0a0a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#00bcff",
              color: "#052f4a",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            {category}
          </div>

          <div
            style={{
              fontSize: title.length > 60 ? 54 : 66,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 26,
              fontWeight: 600,
              color: cover ? "rgba(255,255,255,0.85)" : "#4a5565",
            }}
          >
            <span
              style={{
                width: 48,
                height: 6,
                borderRadius: 999,
                background: "linear-gradient(90deg, #00bcff, #fb64b6)",
              }}
            />
            {site.name}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
