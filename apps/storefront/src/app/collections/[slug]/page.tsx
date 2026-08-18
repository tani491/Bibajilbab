import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { Breadcrumbs } from "@/components/commerce/breadcrumbs"
import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import {
  collections,
  createPageMetadata,
  getCollectionBySlug,
  getProductsByCollection,
} from "@/lib/catalog"
import { getFilteredProducts, parseCatalogFilters, type SearchParamRecord } from "@/lib/filters"

type CollectionPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamRecord>
}

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }))
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)

  if (!collection) {
    return {}
  }

  return createPageMetadata({
    title: collection.name,
    description: collection.description,
    path: `/collections/${collection.slug}`,
  })
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)

  if (!collection) {
    notFound()
  }

  const filters = { ...parseCatalogFilters(await searchParams), collection: collection.slug }
  const filteredProducts = getFilteredProducts(getProductsByCollection(collection.slug), filters)

  return (
    <main className="py-12">
      <Container>
        <Breadcrumbs
          items={[{ href: `/collections/${collection.slug}`, label: collection.name }]}
        />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Collection"
            title={collection.name}
            description={collection.description}
          />
        </div>
        <div className="mt-8">
          <CatalogFiltersForm
            filters={filters}
            pathname={`/collections/${collection.slug}`}
            resetHref={`/collections/${collection.slug}`}
            lockCollection={collection.slug}
          />
        </div>
        <p className="mt-6 text-sm font-medium text-brand-muted">
          {filteredProducts.length} produit(s)
        </p>
        <div className="mt-6">
          <ProductGrid products={filteredProducts} />
        </div>
      </Container>
    </main>
  )
}
