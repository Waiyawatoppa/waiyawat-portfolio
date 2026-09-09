import Image from "next/image";

/**
 * Renders a project/slide cover, falling back to a local gradient when the row
 * has no image. Replaces the previous via.placeholder.com fallback, which was
 * a third-party host that has been offline for extended periods, and which
 * required allowlisting an extra remote origin in next.config.
 */
export default function CoverImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "object-cover",
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-pink-100"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
