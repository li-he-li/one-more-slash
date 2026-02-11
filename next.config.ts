import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mindverseglobal-cos-cdn.mindverse.com',
        pathname: '/front-img/**',
      },
    ],
  },
};

export default nextConfig;
