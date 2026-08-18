import type { MetadataRoute } from "next"

import { parsePublicEnv } from "@bibajilbab/config"

import { categories, collections, getPublishedProducts } from "@/lib/catalog"

const staticRoutes = [
  "/",
  "/catalogue",
  "/recherche",
  "/favoris",
  "/panier",
  "/a-propos",
  "/contact",
  "/faq",
  "/guide-des-tailles",
  "/livraison",
  "/retours-et-echanges",
  "/confidentialite",
  "/conditions-generales",
  "/mentions-legales",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const publicEnv = parsePublicEnv(process.env)
  const now = new Date()
  const categoryRoutes = categories.map((category) => `/categories/${category.slug}`)
  const collectionRoutes = collections.map((collection) => `/collections/${collection.slug}`)
  const productRoutes = getPublishedProducts().map((product) => `/produits/${product.slug}`)

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...productRoutes].map(
    (route) => ({
      url: new URL(route, publicEnv.urls.site).toString(),
      lastModified: now,
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? 1 : 0.7,
    }),
  )
}
