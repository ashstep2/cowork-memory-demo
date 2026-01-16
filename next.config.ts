import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Empty turbopack config to silence error when using webpack
  turbopack: {},
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
