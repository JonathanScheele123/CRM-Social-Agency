import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["prisma-wasm-edge", "@prisma/adapter-neon", "@neondatabase/serverless"],
  outputFileTracingIncludes: {
    "**": ["./node_modules/pg-cloudflare/**/*"],
  },
};

export default nextConfig;
