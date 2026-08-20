import { ChevronDown, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

import { Button } from "@bibajilbab/ui/server"

import { categories, collections } from "@/lib/catalog"
import type { CatalogFilters } from "@/lib/filters"

function uniqueOptions<T extends { id: string; name?: string; label?: string }>(
  items: T[],
): Array<{ value: string; label: string }> {
  const seen = new Set<string>()
  const options: Array<{ value: string; label: string }> = []

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      options.push({ value: item.id, label: item.label ?? item.name ?? item.id })
    }
  }

  return options
}

function getActiveFilterCount(filters: CatalogFilters): number {
  return [
    filters.query,
    filters.category,
    filters.collection,
    filters.size,
    filters.color,
    filters.minPrice,
    filters.maxPrice,
    filters.availability === "available" ? filters.availability : "",
    filters.sort !== "newest" ? filters.sort : "",
  ].filter(Boolean).length
}

export function CatalogFiltersForm({
  filters,
  pathname,
  resetHref,
  lockCategory,
  lockCollection,
  sizeOptions,
  colorOptions,
}: {
  filters: CatalogFilters
  pathname: string
  resetHref: string
  lockCategory?: string
  lockCollection?: string
  sizeOptions: Array<{ value: string; label: string }>
  colorOptions: Array<{ value: string; label: string }>
}) {
  const activeFilterCount = getActiveFilterCount(filters)

  return (
    <form action={pathname} className="rounded-card border border-brand-border bg-white shadow-sm">
      {lockCategory ? <input type="hidden" name="category" value={lockCategory} /> : null}
      {lockCollection ? <input type="hidden" name="collection" value={lockCollection} /> : null}

      <details className="group">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-brand-plum" />
            Filtrer & trier
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-brand-blush px-2 py-0.5 text-xs text-brand-plum">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-5 w-5 text-brand-muted transition group-open:rotate-180"
          />
        </summary>

        <div className="border-t border-brand-border p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Recherche</span>
              <input
                name="q"
                defaultValue={filters.query}
                placeholder="Nom, couleur, référence..."
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              />
            </label>

            {!lockCategory ? (
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Catégorie</span>
                <select
                  name="category"
                  defaultValue={filters.category}
                  className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                >
                  <option value="">Toutes</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {!lockCollection ? (
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Collection</span>
                <select
                  name="collection"
                  defaultValue={filters.collection}
                  className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                >
                  <option value="">Toutes</option>
                  {collections.map((collection) => (
                    <option key={collection.slug} value={collection.slug}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Taille</span>
              <select
                name="size"
                defaultValue={filters.size}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              >
                <option value="">Toutes</option>
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Couleur</span>
              <select
                name="color"
                defaultValue={filters.color}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              >
                <option value="">Toutes</option>
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Prix min</span>
              <input
                type="number"
                min="0"
                name="minPrice"
                defaultValue={filters.minPrice ?? ""}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              />
            </label>

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Prix max</span>
              <input
                type="number"
                min="0"
                name="maxPrice"
                defaultValue={filters.maxPrice ?? ""}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              />
            </label>

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Disponibilité</span>
              <select
                name="availability"
                defaultValue={filters.availability}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              >
                <option value="all">Toutes</option>
                <option value="available">En stock indiqué</option>
              </select>
            </label>

            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Tri</span>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
              >
                <option value="newest">Nouveautés</option>
                <option value="popular">Mise en avant</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit">Appliquer les filtres</Button>
            <Link
              href={resetHref}
              className="inline-flex min-h-11 items-center justify-center rounded-card px-4 text-sm font-medium text-brand-plum transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
            >
              Réinitialiser
            </Link>
          </div>
        </div>
      </details>
    </form>
  )
}
