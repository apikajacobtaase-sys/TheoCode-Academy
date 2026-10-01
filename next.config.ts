import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Your existing rewrites
  async rewrites() {
    return [
      {
        source: '/api/evaluate',
        destination: 'https://br-delicate-king-b4ox58hk-evaluate.compute.c-6.us-east-2.aws.neon.tech/',
      },
    ];
  },
  
  // 2. The new image whitelist for DiceBear avatars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;