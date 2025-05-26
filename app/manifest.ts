import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "보드포트",
    short_name: "보드포트",
    description: "보드게임과 TRPG 중고거래 및 커뮤니티 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#1E40AF",
    orientation: "portrait",
    id: "/",
    scope: "/",
    categories: ["games", "shopping"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/images/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/images/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/images/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/images/favicon-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/images/favicon-196x196.png",
        sizes: "196x196",
        type: "image/png",
      },
      {
        src: "/images/favicon-196x196-maskable.png",
        sizes: "196x196",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
