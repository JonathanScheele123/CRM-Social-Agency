import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingIncludes: {
    "**": ["./node_modules/pg-cloudflare/**/*"],
  },
};

export default nextConfig;
