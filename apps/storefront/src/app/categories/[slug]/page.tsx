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
} from "@/lib/catalog"
import { getFilteredProducts, parseCatalogFilters, type SearchParamRecord } from "@/lib/filters"
import { getStorefrontProducts } from "@/lib/storefront-data"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParamRecord>
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

export const dynamic = "force-dynamic"

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
  const products = await getStorefrontProducts({ status: "published" })
  const filteredProducts = getFilteredProducts(products, filters)
  const sizeOptions = Array.from(
    new Map(products.flatMap((product) => product.sizes).map((item) => [item.id, { value: item.id, label: item.label }])).values(),
  )
  const colorOptions = Array.from(
    new Map(products.flatMap((product) => product.colors).map((item) => [item.id, { value: item.id, label: item.name }])).values(),
  )

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
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
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
