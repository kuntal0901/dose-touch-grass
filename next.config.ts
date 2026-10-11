import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones/laptops on the local network (e.g. http://192.168.x.x:3000) load
  // dev assets; otherwise the client JS is blocked and pages never hydrate.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
