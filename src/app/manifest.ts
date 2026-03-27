import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Enish Ops Hub",
    short_name: "Enish Ops",
    description: "Internal PWA for Enish Restaurant & Lounge Houston staff operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D1A12",
    theme_color: "#1A3D2B",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
