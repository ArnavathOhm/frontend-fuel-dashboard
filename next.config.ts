import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use an environment variable if defined, otherwise local
        destination: process.env.NODE_ENV === 'production'
          ? 'https://arnavath.cloud/api/:path*'
          : 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
