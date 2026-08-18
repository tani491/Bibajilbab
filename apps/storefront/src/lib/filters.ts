import {
  getCategoryName,
  getCollectionName,
  productHasAvailableStock,
  type AvailabilityFilter,
  type SortOption,
  type StoreProduct,
} from "./catalog"
import { parsePositiveInteger } from "./money"

export interface CatalogFilters {
  query: string
  category: string
  collection: string
  size: string
  color: string
  minPrice?: number | undefined
  maxPrice?: number | undefined
  availability: AvailabilityFilter
  sort: SortOption
  page: number
}

export interface FilterOption {
  label: string
  value: string
}

export type SearchParamValue = string | string[] | undefined
export type SearchParamRecord = Record<string, SearchParamValue>

const sortOptions = new Set<SortOption>(["newest", "popular", "price-asc", "price-desc"])
const availabilityOptions = new Set<AvailabilityFilter>(["all", "available"])

function firstParam(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

function parsePrice(value: string): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export function parseCatalogFilters(searchParams: SearchParamRecord): CatalogFilters {
  const sort = firstParam(searchParams.sort)
  const availability = firstParam(searchParams.availability)

  return {
    query: firstParam(searchParams.q).trim(),
    category: firstParam(searchParams.category),
    collection: firstParam(searchParams.collection),
    size: firstParam(searchParams.size),
    color: firstParam(searchParams.color),
    minPrice: parsePrice(firstParam(searchParams.minPrice)),
    maxPrice: parsePrice(firstParam(searchParams.maxPrice)),
    availability: availabilityOptions.has(availability as AvailabilityFilter)
      ? (availability as AvailabilityFilter)
      : "all",
    sort: sortOptions.has(sort as SortOption) ? (sort as SortOption) : "newest",
    page: parsePositiveInteger(firstParam(searchParams.page), 1),
  }
}

export function filterProducts(products: StoreProduct[], filters: CatalogFilters): StoreProduct[] {
  const normalizedQuery = filters.query.toLowerCase()

  return products.filter((product) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        product.name,
        product.sku,
        product.shortDescription,
        getCategoryName(product.categorySlug),
        ...product.collectionSlugs.map(getCollectionName),
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    const matchesCategory = !filters.category || product.categorySlug === filters.category
    const matchesCollection =
      !filters.collection || product.collectionSlugs.includes(filters.collection)
    const matchesSize = !filters.size || product.sizes.some((size) => size.id === filters.size)
    const matchesColor =
      !filters.color || product.colors.some((color) => color.id === filters.color)
    const matchesMinPrice = filters.minPrice === undefined || product.price >= filters.minPrice
    const matchesMaxPrice = filters.maxPrice === undefined || product.price <= filters.maxPrice
    const matchesAvailability = filters.availability === "all" || productHasAvailableStock(product)

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCollection &&
      matchesSize &&
      matchesColor &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesAvailability
    )
  })
}

export function sortProducts(products: StoreProduct[], sort: SortOption): StoreProduct[] {
  const sortedProducts = [...products]

  if (sort === "price-asc") {
    return sortedProducts.sort((a, b) => a.price - b.price)
  }

  if (sort === "price-desc") {
    return sortedProducts.sort((a, b) => b.price - a.price)
  }

  if (sort === "popular") {
    return sortedProducts.sort((a, b) => a.previewRank - b.previewRank)
  }

  return sortedProducts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getFilteredProducts(
  products: StoreProduct[],
  filters: CatalogFilters,
): StoreProduct[] {
  return sortProducts(filterProducts(products, filters), filters.sort)
}

export function paginateProducts<T>(
  items: T[],
  page: number,
  perPage: number,
): { items: T[]; hasNextPage: boolean; visibleCount: number } {
  const visibleCount = Math.min(items.length, Math.max(1, page) * perPage)

  return {
    items: items.slice(0, visibleCount),
    hasNextPage: visibleCount < items.length,
    visibleCount,
  }
}

export function buildCatalogUrl(pathname: string, filters: CatalogFilters, page?: number): string {
  const params = new URLSearchParams()

  if (filters.query) params.set("q", filters.query)
  if (filters.category) params.set("category", filters.category)
  if (filters.collection) params.set("collection", filters.collection)
  if (filters.size) params.set("size", filters.size)
  if (filters.color) params.set("color", filters.color)
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice))
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice))
  if (filters.availability !== "all") params.set("availability", filters.availability)
  if (filters.sort !== "newest") params.set("sort", filters.sort)
  if (page && page > 1) params.set("page", String(page))

  const query = params.toString()

  return query ? `${pathname}?${query}` : pathname
}
