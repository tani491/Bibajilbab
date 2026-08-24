import type { MetadataRoute } from "next"

import { parsePublicEnv } from "@bibajilbab/config"

import { categories, collections } from "@/lib/catalog"
import { getStorefrontProducts } from "@/lib/storefront-data"

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

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicEnv = parsePublicEnv(process.env)
  const now = new Date()
  const staticRouteEntries = staticRoutes.map((route) => ({
    route,
    lastModified: now,
    priority: route === "/" ? 1 : 0.6,
  }))
  const categoryRouteEntries = categories.map((category) => ({
    route: `/categories/${category.slug}`,
    lastModified: now,
    priority: 0.8,
  }))
  const collectionRouteEntries = collections.map((collection) => ({
    route: `/collections/${collection.slug}`,
    lastModified: now,
    priority: 0.8,
  }))
  const productRouteEntries = (await getStorefrontProducts({ status: "published" })).map(
    (product) => ({
      route: `/produits/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      priority: 0.7,
    }),
  )

  return [
    ...staticRouteEntries,
    ...categoryRouteEntries,
    ...collectionRouteEntries,
    ...productRouteEntries,
  ].map(({ route, lastModified, priority }) => ({
      url: new URL(route, publicEnv.urls.site).toString(),
      lastModified,
      changeFrequency: "daily",
      priority,
    }))
}
