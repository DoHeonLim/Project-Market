import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        hostname: "imagedelivery.net",
      },
      {
        hostname: "w7.pngwing.com",
      },
      {
        hostname: "customer-fllme7un34f7981k.cloudflarestream.com",
      },
      {
        hostname: "videodelivery.net",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  importScripts: ["/sw.js"],
  // PWA 추가 설정
  runtimeCaching: [
    {
      // 푸시 알림 관련 API 요청 캐싱
      urlPattern: /\/api\/push\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "push-api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],

  // 서비스 워커 추가 설정
  buildExcludes: [/middleware-manifest\.json$/],

  // 워커 범위 설정
  scope: "/",

  // 오프라인 폴백 페이지
  fallbacks: {
    document: "/offline",
  },
})(nextConfig);
