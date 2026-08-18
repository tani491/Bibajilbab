import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import { z } from "zod"

import { parseServerEnv } from "@bibajilbab/config"

import type { AdminRole } from "./permissions"

const mockSessionType = "bibajilbab-admin-mock-v1"
const mockSessionDurationMs = 5 * 24 * 60 * 60 * 1000

const mockPayloadSchema = z.object({
  type: z.literal(mockSessionType),
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.literal("admin"),
  issuedAt: z.number().int(),
  expiresAt: z.number().int(),
})

export interface MockAdminConfig {
  enabled: boolean
  email: string
  password: string
}

export interface MockAdminSession {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  isMock: true
}

type MockPayload = z.infer<typeof mockPayloadSchema>

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url")
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signatureFor(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

function secureStringEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function sessionFromPayload(payload: MockPayload): MockAdminSession {
  return {
    uid: payload.uid,
    email: payload.email,
    displayName: payload.displayName,
    role: payload.role,
    isMock: true,
  }
}

export function getMockAdminConfig(): MockAdminConfig {
  return parseServerEnv(process.env).adminMockAuth
}

export function verifyMockAdminCredentials({
  email,
  password,
}: {
  email: string
  password: string
}): MockAdminSession | null {
  const config = getMockAdminConfig()

  if (!config.enabled) {
    return null
  }

  const emailMatches = config.email.toLowerCase() === email.trim().toLowerCase()
  const passwordMatches = secureStringEquals(config.password, password)

  if (!emailMatches || !passwordMatches) {
    return null
  }

  return {
    uid: "local-admin",
    email: config.email,
    displayName: "BibaJilbab Admin Local",
    role: "admin",
    isMock: true,
  }
}

export function createMockAdminSessionCookie(session: MockAdminSession): string {
  const config = getMockAdminConfig()

  if (!config.enabled) {
    throw new Error("Le mode admin local est désactivé.")
  }

  const now = Date.now()
  const payload: MockPayload = {
    type: mockSessionType,
    uid: session.uid,
    email: session.email,
    displayName: session.displayName,
    role: "admin",
    issuedAt: now,
    expiresAt: now + mockSessionDurationMs,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signatureFor(encodedPayload, config.password)

  return `${encodedPayload}.${signature}`
}

export function getMockAdminSessionFromCookie(cookieValue: string): MockAdminSession | null {
  const config = getMockAdminConfig()

  if (!config.enabled) {
    return null
  }

  const [encodedPayload, signature] = cookieValue.split(".")

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signatureFor(encodedPayload, config.password)

  if (!secureStringEquals(expectedSignature, signature)) {
    return null
  }

  try {
    const payload = mockPayloadSchema.parse(JSON.parse(base64UrlDecode(encodedPayload)))

    if (payload.expiresAt <= Date.now()) {
      return null
    }

    return sessionFromPayload(payload)
  } catch {
    return null
  }
}
