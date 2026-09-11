import { vi } from "vitest";

// Values the code under test reads at import or render time.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testproject.supabase.co";
process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
process.env.ADMIN_EMAIL = "owner@example.test";

type ImgProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

// next/image needs the Next runtime's image config. For markup assertions a
// plain <img> carrying the attributes we assert on is what we want anyway.
vi.mock("next/image", () => ({
  default: ({ src, alt = "", className, width, height }: ImgProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} width={width} height={height} />
  ),
}));
