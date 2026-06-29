import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";
import path from "path";

const withNextIntl = createNextIntlPlugin();

// Normalize drive letter casing on Windows to prevent Turbopack path mismatch panics
const getNormalizedRoot = () => {
  const rootPath = path.resolve(__dirname, '../../');
  if (rootPath.match(/^[a-z]:/i)) {
    return rootPath.charAt(0).toUpperCase() + rootPath.slice(1);
  }
  return rootPath;
};

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["next-intl"],
  turbopack: {
    root: getNormalizedRoot(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
