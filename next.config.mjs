/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thumbnail10.coupangcdn.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "thumbnail8.coupangcdn.com",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
