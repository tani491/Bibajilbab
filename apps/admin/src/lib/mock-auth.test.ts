import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  createMockAdminSessionCookie,
  getMockAdminSessionFromCookie,
  verifyMockAdminCredentials,
} from "./mock-auth"

const originalEnv = { ...process.env }

function enableMockAuth() {
  vi.stubEnv("NODE_ENV", "development")
  vi.stubEnv("ADMIN_MOCK_AUTH", "true")
  vi.stubEnv("ADMIN_MOCK_EMAIL", "admin@bibajilbab.com")
  vi.stubEnv("ADMIN_MOCK_PASSWORD", "BibaJilbabLocal2026!")
}

describe("mock admin auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    process.env = { ...originalEnv }
  })

  it("creates and verifies a local signed admin session", () => {
    enableMockAuth()
    const session = verifyMockAdminCredentials({
      email: "admin@bibajilbab.com",
      password: "BibaJilbabLocal2026!",
    })

    expect(session).toMatchObject({
      uid: "local-admin",
      role: "admin",
      isMock: true,
    })

    if (!session) {
      throw new Error("Expected mock session")
    }

    const cookie = createMockAdminSessionCookie(session)

    expect(getMockAdminSessionFromCookie(cookie)).toMatchObject({
      email: "admin@bibajilbab.com",
      role: "admin",
      isMock: true,
    })
  })

  it("rejects invalid local credentials", () => {
    enableMockAuth()

    expect(
      verifyMockAdminCredentials({
        email: "admin@bibajilbab.com",
        password: "wrong-password",
      }),
    ).toBeNull()
  })

  it("refuses to enable outside local development", () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("ADMIN_MOCK_AUTH", "true")

    expect(() =>
      verifyMockAdminCredentials({
        email: "admin@bibajilbab.com",
        password: "BibaJilbabLocal2026!",
      }),
    ).toThrow("ADMIN_MOCK_AUTH est reserve au developpement local")
  })
})
