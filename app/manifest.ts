import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Our Journey",
    short_name: "Journey",
    description: "A romantic travel memory app.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#ffeef5",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
