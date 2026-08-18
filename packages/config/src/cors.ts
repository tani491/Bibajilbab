import { parsePublicEnv } from "./env"
import type { PublicEnv } from "./env"

export const allowedHttpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const
export type AllowedHttpMethod = (typeof allowedHttpMethods)[number]

export function getAllowedOrigins(env: PublicEnv = parsePublicEnv(process.env)): string[] {
  const origins = [new URL(env.urls.storefront).origin, new URL(env.urls.admin).origin]

  if (env.isDevelopment || env.isTest) {
    origins.push("http://localhost:3000", "http://localhost:3001")
  }

  return [...new Set(origins)]
}

export function isAllowedOrigin(
  origin: string | null,
  env: PublicEnv = parsePublicEnv(process.env),
): boolean {
  return Boolean(origin && getAllowedOrigins(env).includes(origin))
}

export function createCorsHeaders(
  origin: string | null,
  env: PublicEnv = parsePublicEnv(process.env),
): Headers {
  const headers = new Headers()

  if (isAllowedOrigin(origin, env)) {
    headers.set("Access-Control-Allow-Origin", origin ?? "")
    headers.set("Vary", "Origin")
  }

  headers.set("Access-Control-Allow-Methods", allowedHttpMethods.join(", "))
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  headers.set("Access-Control-Max-Age", "86400")

  return headers
}
