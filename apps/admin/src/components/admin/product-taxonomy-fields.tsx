"use client"

import { FolderPlus, Plus, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button, cn } from "@bibajilbab/ui"

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
]

type ModalKind = "category" | "collection"

function mergeOptions(
  defaults: ProductTaxonomyOption[],
  options: ProductTaxonomyOption[],
): ProductTaxonomyOption[] {
  const byId = new Map<string, ProductTaxonomyOption>()

  for (const option of [...defaults, ...options]) {
    byId.set(option.id, option)
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"))
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "nouvelle-entree"
  )
}

function optionLabel(option: ProductTaxonomyOption): string {
  return option.name
}

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
  const [categoryOptions, setCategoryOptions] = useState(() =>
    mergeOptions(
      defaultCategories,
      defaultCategoryId
        ? [...categories, { id: defaultCategoryId, name: defaultCategoryId }]
        : categories,
    ),
  )
  const [collectionOptions, setCollectionOptions] = useState(() =>
    mergeOptions(
      defaultCollections,
      defaultCollectionIds?.length
        ? [
            ...collections,
            ...defaultCollectionIds.map((id) => ({
              id,
              name: collections.find((collection) => collection.id === id)?.name ?? id,
            })),
          ]
        : collections,
    ),
  )
  const [selectedCategory, setSelectedCategory] = useState(
    defaultCategoryId || categoryOptions[0]?.id || "",
  )
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    defaultCollectionIds?.length ? defaultCollectionIds : [],
  )
  const [modalKind, setModalKind] = useState<ModalKind | null>(null)
  const [newName, setNewName] = useState("")
  const [collectionType, setCollectionType] = useState<ProductTaxonomyOption["type"]>("permanent")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  const selectedCollectionNames = useMemo(
    () =>
      selectedCollections
        .map((id) => collectionOptions.find((option) => option.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [collectionOptions, selectedCollections],
  )

  function applyCreatedOption(createdOption: ProductTaxonomyOption, kind: ModalKind) {
    if (kind === "category") {
      setCategoryOptions((current) => mergeOptions(current, [createdOption]))
      setSelectedCategory(createdOption.id)
    } else {
      setCollectionOptions((current) => mergeOptions(current, [createdOption]))
      setSelectedCollections((current) =>
        current.includes(createdOption.id) ? current : [...current, createdOption.id],
      )
    }

    setModalKind(null)
    setNewName("")
    setCollectionType("permanent")
  }

  function createLocalOption(kind: ModalKind, name: string): ProductTaxonomyOption {
    const slug = slugify(name)

    return {
      id: slug,
      name,
      slug,
      type: kind === "collection" ? collectionType : undefined,
    }
  }

  async function createEntry() {
    const name = newName.trim()

    if (!modalKind || !name) {
      setError("Renseignez un nom.")
      return
    }

    setPending(true)
    setError("")

    try {
      const response = await fetch("/api/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: modalKind,
          name,
          slug: slugify(name),
          collectionType,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        option?: ProductTaxonomyOption
      }

      if (!response.ok || !payload.option) {
        throw new Error(payload.error ?? "Création impossible.")
      }

      const createdOption = payload.option

      applyCreatedOption(createdOption, modalKind)
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Création impossible."

      if (message.toLowerCase().includes("base de données")) {
        applyCreatedOption(createLocalOption(modalKind, name), modalKind)
        return
      }

      setError(message)
    } finally {
      setPending(false)
    }
  }

  function toggleCollection(id: string) {
    setSelectedCollections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <section className="grid gap-4 md:col-span-2 md:grid-cols-2">
      <input type="hidden" name="collectionIds" value={selectedCollections.join(", ")} />

      <div className="rounded-card border border-brand-border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-ink">Catégorie</p>
            <p className="mt-1 text-xs text-brand-muted">Famille principale du vêtement.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setModalKind("category")}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Ajouter
          </Button>
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-ink">Collections</p>
            <p className="mt-1 text-xs text-brand-muted">Événement ou sélection spéciale.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setModalKind("collection")}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Ajouter
          </Button>
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
          {selectedCollectionNames.length > 0
            ? selectedCollectionNames.join(", ")
            : "Aucune collection sélectionnée."}
        </p>
      </div>

      {modalKind ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/30 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="taxonomy-dialog-title"
            className="w-full max-w-md rounded-card border border-brand-border bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="taxonomy-dialog-title" className="text-lg font-semibold text-brand-ink">
                  {modalKind === "category" ? "Nouvelle catégorie" : "Nouvelle collection"}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Elle sera ajoutée à la liste sans quitter cette fiche.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalKind(null)}
                className="flex h-9 w-9 items-center justify-center rounded-card text-brand-muted transition hover:bg-brand-blush hover:text-brand-plum focus-visible:outline-none focus-visible:shadow-focus"
                aria-label="Fermer"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="text-sm font-medium text-brand-ink">
                <span className="mb-2 block">Nom</span>
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void createEntry()
                    }
                  }}
                  className="h-11 w-full rounded-card border border-brand-border px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                />
              </label>

              {modalKind === "collection" ? (
                <label className="text-sm font-medium text-brand-ink">
                  <span className="mb-2 block">Type</span>
                  <select
                    value={collectionType}
                    onChange={(event) =>
                      setCollectionType(event.target.value as ProductTaxonomyOption["type"])
                    }
                    className="h-11 w-full rounded-card border border-brand-border bg-white px-3 text-sm outline-none transition focus:border-brand-plum focus:shadow-focus"
                  >
                    <option value="permanent">Permanent</option>
                    <option value="tabaski">Tabaski</option>
                    <option value="korite">Korité</option>
                    <option value="seasonal">Saisonnier</option>
                  </select>
                </label>
              ) : null}

              {error ? (
                <p className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setModalKind(null)}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => void createEntry()}
                  isLoading={pending}
                  leftIcon={<FolderPlus aria-hidden="true" className="h-4 w-4" />}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
