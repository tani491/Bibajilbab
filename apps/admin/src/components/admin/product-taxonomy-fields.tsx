"use client"

export interface ProductTaxonomyOption {
  id: string
  name: string
  slug?: string | undefined
  type?: "permanent" | "tabaski" | "korite" | "seasonal" | undefined
}

const defaultCategories: ProductTaxonomyOption[] = [
  { id: "djilbabs", name: "Jilbab", slug: "djilbabs" },
  { id: "khimars", name: "Khimar", slug: "khimars" },
  { id: "tuniques", name: "Tunique", slug: "tuniques" },
  { id: "ensembles", name: "Ensemble", slug: "ensembles" },
  { id: "priere", name: "Prière", slug: "priere" },
]

const defaultCollections: ProductTaxonomyOption[] = [
  { id: "nouveautes", name: "Nouvelle Collection", slug: "nouveautes", type: "permanent" },
  { id: "tabaski", name: "Tabaski", slug: "tabaski", type: "tabaski" },
  { id: "vente-flash", name: "Vente Flash", slug: "vente-flash", type: "seasonal" },
]

export function ProductTaxonomyFields({
  categories,
  collections,
  defaultCategoryId,
  defaultCollectionIds,
}: {
  categories: ProductTaxonomyOption[]
  collections: ProductTaxonomyOption[]
  defaultCategoryId?: string | undefined
  defaultCollectionIds?: string[] | undefined
}) {
  const categoryOptions = categories.length > 0 ? categories : defaultCategories
  const collectionOptions = collections.length > 0 ? collections : defaultCollections
  const selectedCategory = defaultCategoryId || categoryOptions[0]?.id || "non-classe"
  const selectedCollection = defaultCollectionIds?.[0] ?? ""

  return (
    <section className="grid gap-4 rounded-card border border-brand-border bg-white p-4 md:col-span-2 md:grid-cols-2">
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Catégorie</span>
        <select
          name="categoryId"
          defaultValue={selectedCategory}
          required
          className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-brand-ink">
        <span className="mb-2 block">Collection</span>
        <select
          name="collectionIds"
          defaultValue={selectedCollection}
          className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
        >
          <option value="">Aucune collection</option>
          {collectionOptions.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
