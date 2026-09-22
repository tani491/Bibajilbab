import path from "node:path"
import { fileURLToPath } from "node:url"

import { createSecurityHeaders } from "../../security-headers.mjs"
import { validateProductionEnv } from "@bibajilbab/config/env"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Validate environment variables at build time for production
const shouldValidateProductionEnv =
  process.env.APP_ENV === "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "production" ||
  process.env.VERCEL_ENV === "production"

if (shouldValidateProductionEnv) {
  try {
    validateProductionEnv(process.env)
  } catch (error) {
    console.warn("Environment validation warning:", error.message)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "jwks-rsa",
    "jose",
  ],
  bundlePagesRouterDependencies: false,
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
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: createSecurityHeaders({ admin: true }),
      },
    ]
  },
}

export default nextConfig
