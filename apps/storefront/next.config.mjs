import { createSecurityHeaders } from "../../security-headers.mjs"
import { validateProductionEnv } from "@bibajilbab/config/env"

// Validate environment variables at build time for production
const shouldValidateProductionEnv =
  process.env.APP_ENV === "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "production" ||
  process.env.VERCEL_ENV === "production"

if (shouldValidateProductionEnv) {
  try {
    validateProductionEnv(process.env)
  } catch (error) {
    console.error("Environment validation failed:", error.message)
    process.exit(1)
  }
}

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
