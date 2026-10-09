import type { NextConfig } from "next";

/** Supabase Storage host, derived from the project URL so uploaded media can be optimised by next/image. */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

/**
 * Public address used for canonical links, the sitemap and social previews.
 * NEXT_PUBLIC_SITE_URL wins (set it for a custom domain); on Vercel it otherwise
 * falls back to the project's production domain rather than localhost.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: siteUrl ? { NEXT_PUBLIC_SITE_URL: siteUrl } : {},
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560],
    remotePatterns: [
      // Representative placeholder imagery (seeded demo projects).
      { protocol: "https", hostname: "images.unsplash.com" },
      // Studio uploads stored in Supabase Storage.
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  async redirects() {
    // The editorial index now lives in the filterable portfolio.
    return [{ source: "/projects", destination: "/portfolio", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
