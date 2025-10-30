import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to avoid font issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
