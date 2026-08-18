import "server-only"

import { headers } from "next/headers"

import { parsePublicEnv } from "@bibajilbab/config"

function normalizeOrigin(value: string | null): string | null {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function originFromHost(host: string | null, forwardedProto: string | null): string | null {
  if (!host) {
    return null
  }

  const proto =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https")

  return `${proto}://${host}`
}

function allowedAdminOrigins(host: string | null, forwardedProto: string | null): Set<string> {
  const env = parsePublicEnv(process.env)
  const origins = new Set<string>([new URL(env.urls.admin).origin])
  const currentOrigin = originFromHost(host, forwardedProto)

  if (currentOrigin) {
    origins.add(currentOrigin)
  }

  return origins
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = normalizeOrigin(request.headers.get("origin"))
  const referer = normalizeOrigin(request.headers.get("referer"))
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto")
  const allowedOrigins = allowedAdminOrigins(host, proto)

  if (origin) {
    return allowedOrigins.has(origin)
  }

  if (referer) {
    return allowedOrigins.has(referer)
  }

  return false
}

export async function assertSameOriginRequest(): Promise<void> {
  const headerStore = await headers()
  const origin = normalizeOrigin(headerStore.get("origin"))
  const referer = normalizeOrigin(headerStore.get("referer"))
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const proto = headerStore.get("x-forwarded-proto")
  const allowedOrigins = allowedAdminOrigins(host, proto)

  if (origin && allowedOrigins.has(origin)) {
    return
  }

  if (!origin && referer && allowedOrigins.has(referer)) {
    return
  }

  throw new Error("Origine de requête refusée.")
}
