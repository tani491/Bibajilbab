import { brandConfig } from "./brand"
import { parsePublicEnv } from "./env"
import type { PublicEnv } from "./env"

export interface ProductUrlInput {
  slug: string
  pathPrefix?: string
}

export interface WhatsAppUrlInput {
  message: string
  productSlug?: string | undefined
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "")
}

export function createAbsoluteUrl(baseUrl: string, path = "/"): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, baseUrl)
  return url.toString()
}

export function getStorefrontUrl(env: PublicEnv = parsePublicEnv(process.env)): string {
  return env.urls.storefront
}

export function getAdminUrl(env: PublicEnv = parsePublicEnv(process.env)): string {
  return env.urls.admin
}

export function getCanonicalUrl(
  path: string,
  env: PublicEnv = parsePublicEnv(process.env),
): string {
  return createAbsoluteUrl(env.urls.site, path)
}

export function getProductUrl(
  { slug, pathPrefix = "produits" }: ProductUrlInput,
  env: PublicEnv = parsePublicEnv(process.env),
): string {
  return createAbsoluteUrl(env.urls.storefront, `/${trimSlashes(pathPrefix)}/${trimSlashes(slug)}`)
}

export function getWhatsAppUrl(
  { message, productSlug }: WhatsAppUrlInput,
  env: PublicEnv = parsePublicEnv(process.env),
): string {
  const productLine = productSlug
    ? `\nLien produit : ${getProductUrl({ slug: productSlug }, env)}`
    : ""
  const encodedMessage = encodeURIComponent(`${message}${productLine}`)

  return `https://wa.me/${env.brand.whatsappNumber || brandConfig.whatsapp.technical}?text=${encodedMessage}`
}

export function isAllowedRedirectUrl(
  target: string,
  env: PublicEnv = parsePublicEnv(process.env),
): boolean {
  try {
    const targetUrl = new URL(target, env.urls.storefront)
    const allowedOrigins = new Set([
      new URL(env.urls.storefront).origin,
      new URL(env.urls.admin).origin,
    ])

    if (env.isDevelopment || env.isTest) {
      allowedOrigins.add("http://localhost:3000")
      allowedOrigins.add("http://localhost:3001")
    }

    return allowedOrigins.has(targetUrl.origin)
  } catch {
    return false
  }
}
