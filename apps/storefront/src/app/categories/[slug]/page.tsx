import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container, SectionHeading } from "@bibajilbab/ui/server"

import { Breadcrumbs } from "@/components/commerce/breadcrumbs"
import { CatalogFiltersForm } from "@/components/commerce/catalog-filters-form"
import { ProductGrid } from "@/components/commerce/product-grid"
import {
  categories,
  createPageMetadata,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/catalog"
import { getFilteredProducts, parseCatalogFilters, type SearchParamRecord } from "@/lib/filters"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamRecord>
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    return {}
  }

  return createPageMetadata({
    title: category.name,
    description: category.description,
    path: `/categories/${category.slug}`,
  })
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const filters = { ...parseCatalogFilters(await searchParams), category: category.slug }
  const filteredProducts = getFilteredProducts(getProductsByCategory(category.slug), filters)

  return (
    <main className="py-12">
      <Container>
        <Breadcrumbs items={[{ href: `/categories/${category.slug}`, label: category.name }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Catégorie"
            title={category.name}
            description={category.description}
          />
        </div>
        <div className="mt-8">
          <CatalogFiltersForm
            filters={filters}
            pathname={`/categories/${category.slug}`}
            resetHref={`/categories/${category.slug}`}
            lockCategory={category.slug}
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
