import { describe, expect, it } from "vitest"

import { parsePublicEnv, parseServerEnv, validateProductionEnv } from "./env"
import { getProductUrl, getWhatsAppUrl } from "./urls"

describe("environment configuration", () => {
  it("uses localhost defaults and demo data in development without external keys", () => {
    const env = parsePublicEnv({
      NODE_ENV: "development",
    })

    expect(env.appEnv).toBe("development")
    expect(env.urls.storefront).toBe("http://localhost:3000")
    expect(env.urls.admin).toBe("http://localhost:3001")
    expect(env.demoDataEnabled).toBe(true)
    expect(env.firebase.configured).toBe(false)
  })

  it("never enables demo data in production", () => {
    const env = parsePublicEnv({
      APP_ENV: "production",
      NEXT_PUBLIC_ENABLE_DEMO_DATA: "true",
    })

    expect(env.demoDataEnabled).toBe(false)
    expect(env.urls.storefront).toBe("https://bibajilbab.com")
  })

  it("enables demo admin credentials only in local development", () => {
    const publicEnv = parsePublicEnv({
      NODE_ENV: "development",
      NEXT_PUBLIC_ENABLE_DEMO_ADMIN: "true",
    })
    const serverEnv = parseServerEnv({
      NODE_ENV: "development",
      ADMIN_MOCK_AUTH: "true",
    })

    expect(publicEnv.demoAdmin.enabled).toBe(true)
    expect(publicEnv.demoAdmin.email).toBe("admin@bibajilbab.com")
    expect(serverEnv.adminMockAuth.enabled).toBe(true)
    expect(serverEnv.adminMockAuth.email).toBe("admin@bibajilbab.com")
  })

  it("rejects demo admin flags outside NODE_ENV development", () => {
    expect(() =>
      parsePublicEnv({
        NODE_ENV: "production",
        NEXT_PUBLIC_ENABLE_DEMO_ADMIN: "true",
      }),
    ).toThrow("NEXT_PUBLIC_ENABLE_DEMO_ADMIN est reserve au developpement local")

    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        ADMIN_MOCK_AUTH: "true",
      }),
    ).toThrow("ADMIN_MOCK_AUTH est reserve au developpement local")
  })

  it("builds product and WhatsApp URLs from the configured environment", () => {
    const env = parsePublicEnv({
      APP_ENV: "development",
      NEXT_PUBLIC_STOREFRONT_URL: "http://localhost:3000",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "221770825302",
    })

    expect(getProductUrl({ slug: "khimar-demo" }, env)).toBe(
      "http://localhost:3000/produits/khimar-demo",
    )
    expect(getWhatsAppUrl({ message: "Bonjour", productSlug: "khimar-demo" }, env)).toContain(
      "https://wa.me/221770825302?text=",
    )
  })

  it("reports missing production service variables", () => {
    expect(() => validateProductionEnv({ APP_ENV: "production" })).toThrow(
      "Configuration production incomplete",
    )
  })
})
