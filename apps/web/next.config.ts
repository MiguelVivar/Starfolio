import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@starfolio/types",
    "@starfolio/utils",
    "@starfolio/github-exporter",
    "@starfolio/exporters",
  ],
};

export default nextConfig;
