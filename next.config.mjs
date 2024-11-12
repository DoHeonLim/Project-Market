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
    ],
  },
};

export default nextConfig;
