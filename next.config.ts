import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.vector-park.jp",
      },
    ],
  },
};

export default nextConfig;
