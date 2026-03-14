import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinTrack AI",
    short_name: "FinTrack",
    description: "AI-powered personal expense tracker for India.",
    start_url: "/",
    display: "standalone",
    background_color: "#040d14",
    theme_color: "#040d14",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
