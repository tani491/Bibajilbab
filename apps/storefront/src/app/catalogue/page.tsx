import Link from "next/link"

import { Container, SectionHeading, buttonStyles } from "@bibajilbab/ui/server"

import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import { createPageMetadata, getPublishedProducts } from "@/lib/catalog"
import {
  buildCatalogUrl,
  getFilteredProducts,
  paginateProducts,
  parseCatalogFilters,
  type SearchParamRecord,
} from "@/lib/filters"

export const metadata = createPageMetadata({
  title: "Catalogue",
  description: "Catalogue public BibaJilbab avec filtres, favoris et demandes WhatsApp.",
  path: "/catalogue",
})

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>
}) {
  const filters = parseCatalogFilters(await searchParams)
  const allProducts = getPublishedProducts()
  const filteredProducts = getFilteredProducts(allProducts, filters)
  const paginated = paginateProducts(filteredProducts, filters.page, 8)

  return (
    <main className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Catalogue"
          title="Tous les produits"
          description="Filtrez les produits d'aperçu. Les disponibilités réelles seront confirmées sur WhatsApp."
        />
        <div className="mt-8">
          <CatalogFiltersForm filters={filters} pathname="/catalogue" resetHref="/catalogue" />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-brand-muted">
            {filteredProducts.length} résultat(s), {paginated.visibleCount} affiché(s)
          </p>
          <Link
            href="/recherche"
            className="text-sm font-medium text-brand-plum hover:text-brand-mauve"
          >
            Recherche avancée
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={paginated.items} />
        </div>
        {paginated.hasNextPage ? (
          <div className="mt-8 flex justify-center">
            <Link
              className={buttonStyles({ variant: "outline" })}
              href={buildCatalogUrl("/catalogue", filters, filters.page + 1)}
            >
              Afficher plus de produits
            </Link>
          </div>
        ) : null}
      </Container>
    </main>
  )
}
