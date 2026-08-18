import { EmptyState } from "@bibajilbab/ui/server"

import type { StoreProduct } from "@/lib/catalog"

import { ProductCardClient } from "./product-card-client"

export function ProductGrid({
  products,
  emptyTitle = "Aucun produit trouvé",
  emptyDescription = "Essayez de modifier les filtres ou de revenir au catalogue complet.",
}: {
  products: StoreProduct[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCardClient key={product.id} product={product} />
      ))}
    </div>
  )
}
