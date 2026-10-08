import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* TrustLock is a demo with runtime prototype data; classic dynamic
     rendering fits better than the cache-components prerender model. */
  cacheComponents: false,
  partialPrefetching: false,
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
