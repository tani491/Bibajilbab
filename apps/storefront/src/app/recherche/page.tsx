import { Search } from "lucide-react"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import { createPageMetadata, getPublishedProducts } from "@/lib/catalog"
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>
}) {
  const filters = parseCatalogFilters(await searchParams)
  const filteredProducts = getFilteredProducts(getPublishedProducts(), filters)
  const paginated = paginateProducts(filteredProducts, filters.page, 12)

  return (
    <main className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Recherche"
          title={filters.query ? `Résultats pour "${filters.query}"` : "Trouver un article"}
          description="Recherchez par nom, référence, couleur ou collection. Les filtres restent dans l'URL."
        />
        <div className="mt-8">
          <CatalogFiltersForm filters={filters} pathname="/recherche" resetHref="/recherche" />
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
