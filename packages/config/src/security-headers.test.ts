import { describe, expect, it } from "vitest"

type SecurityHeadersModule = {
  createSecurityHeaders: (options?: { admin?: boolean; isDevelopment?: boolean }) => Array<{
    key: string
    value: string
  }>
}

async function loadSecurityHeaders(): Promise<SecurityHeadersModule> {
  const moduleUrl = new URL("../../../security-headers.mjs", import.meta.url).href
  const loadedHeaders = (await import(moduleUrl)) as unknown

  return loadedHeaders as SecurityHeadersModule
}

describe("security headers", () => {
  it("sets restrictive baseline headers for the storefront", async () => {
    const { createSecurityHeaders } = await loadSecurityHeaders()
    const headers = createSecurityHeaders()
    const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value

    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain("'unsafe-eval'")
    expect(headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" })
    expect(headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" })
  })

  it("allows eval only for the Next.js development runtime", async () => {
    const { createSecurityHeaders } = await loadSecurityHeaders()
    const headers = createSecurityHeaders({ isDevelopment: true })
    const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value

    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'")
  })

  it("adds noindex for the administration project", async () => {
    const { createSecurityHeaders } = await loadSecurityHeaders()

    expect(createSecurityHeaders({ admin: true })).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow",
    })
  })
})
