"use client"

import type { StoreProduct } from "@/lib/catalog"

import { ProductCardClient } from "./product-card-client"
import { useStorefrontState } from "./store-provider"

export function RecentlyViewedProducts({
  products,
  currentSlug,
  categoryLabels = {},
}: {
  products: StoreProduct[]
  currentSlug: string
  categoryLabels?: Record<string, string>
}) {
  const { recentlyViewed } = useStorefrontState()
  const viewedProducts = recentlyViewed
    .filter((slug) => slug !== currentSlug)
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is StoreProduct => Boolean(product))
    .slice(0, 4)

  if (viewedProducts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {viewedProducts.map((product) => (
        <ProductCardClient
          key={product.id}
          product={product}
          categoryName={categoryLabels[product.categorySlug]}
        />
      ))}
    </div>
  )
}
