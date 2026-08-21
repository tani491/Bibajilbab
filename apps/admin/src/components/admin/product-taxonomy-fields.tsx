"use client"

import { useState } from "react"

import { cn } from "@bibajilbab/ui"

export interface ProductTaxonomyOption {
  id: string
  name: string
  slug?: string | undefined
  type?: "permanent" | "tabaski" | "korite" | "seasonal" | undefined
}

const defaultCategories: ProductTaxonomyOption[] = [
  { id: "djilbabs", name: "Djilbabs", slug: "djilbabs" },
  { id: "khimars", name: "Khimars", slug: "khimars" },
  { id: "tuniques", name: "Tuniques", slug: "tuniques" },
  { id: "priere", name: "Prière", slug: "priere" },
]

const defaultCollections: ProductTaxonomyOption[] = [
  { id: "tabaski", name: "Tabaski", slug: "tabaski", type: "tabaski" },
  { id: "korite", name: "Korité", slug: "korite", type: "korite" },
  { id: "nouveautes", name: "Nouveautés", slug: "nouveautes", type: "permanent" },
]

function optionLabel(option: ProductTaxonomyOption): string {
  return option.name
}

export function ProductTaxonomyFields({
  categories: _categories,
  collections: _collections,
  defaultCategoryId,
  defaultCollectionIds,
}: {
  categories: ProductTaxonomyOption[]
  collections: ProductTaxonomyOption[]
  defaultCategoryId?: string | undefined
  defaultCollectionIds?: string[] | undefined
}) {
  const categoryOptions = defaultCategories
  const collectionOptions = defaultCollections
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategoryId || categoryOptions[0]?.id || "",
  )
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    defaultCollectionIds?.length ? defaultCollectionIds : [],
  )

  function toggleCollection(id: string) {
    setSelectedCollections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <section className="grid gap-4 md:col-span-2 md:grid-cols-2">
      <input type="hidden" name="collectionIds" value={selectedCollections.join(", ")} />

      <div className="rounded-card border border-brand-border bg-white p-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-brand-ink">Catégorie</p>
            <p className="mt-1 text-xs text-brand-muted">Famille principale du vêtement.</p>
          </div>
        </div>
        <select
          name="categoryId"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          required
          className="mt-4 h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {optionLabel(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-card border border-brand-border bg-white p-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-brand-ink">Collections</p>
            <p className="mt-1 text-xs text-brand-muted">Événement ou sélection spéciale.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {collectionOptions.map((collection) => {
            const selected = selectedCollections.includes(collection.id)

            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => toggleCollection(collection.id)}
                className={cn(
                  "min-h-10 rounded-card border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:shadow-focus",
                  selected
                    ? "border-brand-plum bg-brand-plum text-white"
                    : "border-brand-border bg-white text-brand-ink hover:border-brand-plum",
                )}
              >
                {collection.name}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-brand-muted">
          {selectedCollections.length > 0
            ? selectedCollections
                .map((id) => collectionOptions.find((option) => option.id === id)?.name)
                .filter((name): name is string => Boolean(name))
                .join(", ")
            : "Aucune collection sélectionnée."}
        </p>
      </div>
    </section>
  )
}
