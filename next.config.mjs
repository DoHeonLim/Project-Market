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
    ],
  },
};

export default nextConfig;
