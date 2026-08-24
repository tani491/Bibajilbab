import { MetadataRoute } from "next"

import { getAllProducts } from "@/lib/firestore/products"

type SitemapProduct = {
  id?: string
  slug?: string
  updatedAt?: string | number | Date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bibajilbab.shop"
  let productUrls: MetadataRoute.Sitemap = []

  try {
    const products: unknown = await getAllProducts()

    if (Array.isArray(products)) {
      productUrls = products.map((product: SitemapProduct) => ({
        url: `${baseUrl}/produits/${product.slug || product.id}`,
        lastModified: new Date(product.updatedAt || Date.now()),
        changeFrequency: "daily",
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error("Erreur sitemap:", error)
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/catalogue",
    "/a-propos",
    "/contact",
    "/faq",
    "/guide-des-tailles",
    "/livraison",
    "/retours-et-echanges",
    "/mentions-legales",
    "/conditions-generales",
    "/confidentialite",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.6,
  }))

  return [...staticRoutes, ...productUrls]
}
