import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone/ bundle for deployment.
  // Transfer standalone/ + .next/static/ + public/ — no node_modules copy needed.
  output: 'standalone',
};

export default nextConfig;
