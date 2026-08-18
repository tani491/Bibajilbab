import { createSecurityHeaders } from "../../security-headers.mjs"

/** @type {import("next").NextConfig} */
const nextConfig = {
  agentRules: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  transpilePackages: ["@bibajilbab/config", "@bibajilbab/types", "@bibajilbab/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: createSecurityHeaders(),
      },
    ]
  },
}

export default nextConfig
