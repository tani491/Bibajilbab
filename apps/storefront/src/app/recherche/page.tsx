import { Search } from "lucide-react"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import { createPageMetadata } from "@/lib/catalog"
import { getStorefrontProducts } from "@/lib/storefront-data"
import {
  getFilteredProducts,
  paginateProducts,
  parseCatalogFilters,
  type SearchParamRecord,
} from "@/lib/filters"

export const metadata = createPageMetadata({
  title: "Recherche",
  description: "Rechercher un produit BibaJilbab par nom, couleur, catégorie ou collection.",
  path: "/recherche",
})

export const dynamic = "force-dynamic"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>
}) {
  const filters = parseCatalogFilters(await searchParams)
  const products = await getStorefrontProducts({ status: "published" })
  const filteredProducts = getFilteredProducts(products, filters)
  const paginated = paginateProducts(filteredProducts, filters.page, 12)
  const sizeOptions = Array.from(
    new Map(products.flatMap((product) => product.sizes).map((item) => [item.id, { value: item.id, label: item.label }])).values(),
  )
  const colorOptions = Array.from(
    new Map(products.flatMap((product) => product.colors).map((item) => [item.id, { value: item.id, label: item.name }])).values(),
  )

  return (
    <main className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Recherche"
          title={filters.query ? `Résultats pour "${filters.query}"` : "Trouver un article"}
          description="Recherchez par nom, référence, couleur ou collection. Les filtres restent dans l'URL."
        />
        <div className="mt-8">
          <CatalogFiltersForm
            filters={filters}
            pathname="/recherche"
            resetHref="/recherche"
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
          />
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-brand-muted">
          <Search aria-hidden="true" className="h-4 w-4" />
          {filteredProducts.length} résultat(s)
        </p>
        <div className="mt-6">
          <ProductGrid
            products={paginated.items}
            emptyTitle="Aucun résultat"
            emptyDescription="Essayez une recherche plus courte ou revenez au catalogue complet."
          />
        </div>
      </Container>
    </main>
  )
}
