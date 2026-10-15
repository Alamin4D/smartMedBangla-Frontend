import type { NextConfig } from "next";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    /**
     * Dashboard/admin pages are client components behind a client-side auth gate (DashboardShell),
     * so the server-side validation never sees them and flags every page as "dropped from rendering".
     * Only validate segments that opt in with `export const instant = true`.
     */
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  /**
   * The browser talks to the Express API through this same-origin proxy,
   * so httpOnly auth cookies work without third-party-cookie problems.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
