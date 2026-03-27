import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /\/api\/pwa\/flush/,
      handler: "NetworkOnly",
      method: "POST",
    },
    {
      urlPattern: /\/(checklists|inventory|manifest\.webmanifest|offline)/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "enish-shell",
      },
    },
    {
      urlPattern: /^https:\/\/.*supabase\.co\/rest\/v1\/(checklists|inventory_items)/,
      handler: "NetworkFirst",
      options: {
        cacheName: "enish-data",
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
