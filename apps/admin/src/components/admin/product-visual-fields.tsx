"use client"

import { ImagePlus, Star, Trash2, UploadCloud, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"

import type { ProductColor, ProductImage, ProductSize, ProductVariant } from "@bibajilbab/types"
import { Button, cn } from "@bibajilbab/ui"

const standardSizes: ProductSize[] = [
  { id: "taille-unique", label: "Taille Unique", description: "Coupe unique" },
  { id: "s", label: "S" },
  { id: "m", label: "M" },
  { id: "l", label: "L" },
  { id: "xl", label: "XL" },
  { id: "52", label: "52" },
  { id: "54", label: "54" },
  { id: "56", label: "56" },
  { id: "58", label: "58" },
]

const defaultProductSize: ProductSize = {
  id: "taille-unique",
  label: "Taille Unique",
  description: "Coupe unique",
}

interface UploadResult {
  secureUrl: string
  publicId: string
  width?: number | undefined
  height?: number | undefined
}

interface EditableImage extends ProductImage {
  localId: string
  previewUrl?: string | undefined
  uploading?: boolean | undefined
  error?: string | undefined
}

function isUploadResponse(value: unknown): value is { uploads: UploadResult[] } {
  return Boolean(
    value && typeof value === "object" && Array.isArray((value as { uploads?: unknown }).uploads),
  )
}

function createLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "option"
  )
}

function normalizeImages(images: EditableImage[]): EditableImage[] {
  return images.map((image, index) => ({ ...image, position: index }))
}

function existingStockMap(variants: ProductVariant[] | undefined): Record<string, number> {
  const map: Record<string, number> = {}

  for (const variant of variants ?? []) {
    map[variant.id] = variant.stock
  }

  return map
}

function existingStatusMap(
  variants: ProductVariant[] | undefined,
): Record<string, ProductVariant["status"]> {
  const map: Record<string, ProductVariant["status"]> = {}

  for (const variant of variants ?? []) {
    map[variant.id] = variant.status
  }

  return map
}

function variantKey(sizeId: string | undefined, colorId: string | undefined): string {
  return [sizeId, colorId].filter(Boolean).join("-") || "standard"
}

function findExistingVariant(
  variants: ProductVariant[] | undefined,
  sizeId: string | undefined,
  colorId: string | undefined,
): ProductVariant | undefined {
  return variants?.find((variant) => variant.sizeId === sizeId && variant.colorId === colorId)
}

function imageFromUpload(upload: UploadResult, alt: string, position: number): EditableImage {
  return {
    localId: createLocalId("image"),
    id: upload.publicId,
    url: upload.secureUrl,
    cloudinaryPublicId: upload.publicId,
    alt,
    width: upload.width,
    height: upload.height,
    position,
  }
}

function friendlyUploadError(message: string): string {
  return message.toLowerCase().includes("cloudinary")
    ? "Aperçu local ajouté. La configuration Cloudinary sera nécessaire pour publier les images en production."
    : message
}

function visibleImagesJson(images: EditableImage[]): string {
  const persistedImages: ProductImage[] = normalizeImages(images)
    .filter((image) => image.url && !image.uploading)
    .map((image, position) => ({
      id: image.id,
      url: image.url,
      cloudinaryPublicId: image.cloudinaryPublicId,
      alt: image.alt || "Image produit",
      width: image.width,
      height: image.height,
      position,
    }))

  return JSON.stringify(persistedImages)
}

export function ProductVisualFields({
  product,
}: {
  product?: {
    images?: ProductImage[] | undefined
    sizes?: ProductSize[] | undefined
    colors?: ProductColor[] | undefined
    variants?: ProductVariant[] | undefined
    sku?: string | undefined
    badge?: string | undefined
  }
}) {
  const initialVariants = product?.variants ?? []
  const [baseSku, setBaseSku] = useState(product?.sku ?? "")
  const [images, setImages] = useState<EditableImage[]>(() =>
    (product?.images ?? []).map((image, index) => ({
      ...image,
      localId: image.id ?? `image-${index}`,
      position: index,
    })),
  )
  const [sizes, setSizes] = useState<ProductSize[]>(
    product?.sizes?.length ? product.sizes : [defaultProductSize],
  )
  const [customSize, setCustomSize] = useState("")
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors ?? [],
  )
  const [newColorName, setNewColorName] = useState("")
  const [newColorHex, setNewColorHex] = useState("#E9B7C5")
  const [stockByVariant, setStockByVariant] = useState<Record<string, number>>(() =>
    existingStockMap(product?.variants),
  )
  const [statusByVariant, setStatusByVariant] = useState<Record<string, ProductVariant["status"]>>(
    () => existingStatusMap(initialVariants),
  )
  const [uploadError, setUploadError] = useState("")

  const variants = useMemo<ProductVariant[]>(() => {
    const sizeOptions = sizes.length > 0 ? sizes : [undefined]
    const colorOptions = colors.length > 0 ? colors : [undefined]
    const nextVariants: ProductVariant[] = []

    for (const size of sizeOptions) {
      for (const color of colorOptions) {
        const existingVariant = findExistingVariant(product?.variants, size?.id, color?.id)
        const id = existingVariant?.id ?? variantKey(size?.id, color?.id)
        const stock = stockByVariant[id] ?? 0
        const selectedStatus = stock > 0 ? "active" : (statusByVariant[id] ?? existingVariant?.status ?? "inactive")

        nextVariants.push({
          id,
          sku:
            existingVariant?.sku ??
            [baseSku || "BJ", size?.id, color?.id].filter(Boolean).join("-").toUpperCase(),
          sizeId: size?.id,
          colorId: color?.id,
          stock,
          lowStockThreshold: existingVariant?.lowStockThreshold ?? 2,
          status: selectedStatus,
        })
      }
    }

    return nextVariants
  }, [baseSku, colors, product?.variants, sizes, statusByVariant, stockByVariant])

  const selectedStandardSizeIds = new Set(sizes.map((size) => size.id))
  const sizesJson = JSON.stringify(sizes)
  const colorsJson = JSON.stringify(colors)
  const variantsJson = JSON.stringify(variants)

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)

    if (files.length === 0) {
      return
    }

    setUploadError("")

    const pendingImages: EditableImage[] = files.map((file, index) => ({
      localId: createLocalId("pending"),
      url: "",
      previewUrl: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^.]+$/u, "") || "Image produit",
      position: images.length + index,
      uploading: true,
    }))

    setImages((current) => normalizeImages([...current, ...pendingImages]))

    try {
      const body = new FormData()
      body.set("folder", "bibajilbab/produits")
      files.forEach((file) => body.append("files", file))

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body,
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" ? (payload as { error?: unknown }).error : null
        throw new Error(typeof message === "string" ? message : "Téléversement refusé.")
      }

      if (!isUploadResponse(payload)) {
        throw new Error("Réponse de téléversement invalide.")
      }

      setImages((current) => {
        const pendingIds = pendingImages.map((image) => image.localId)
        const withoutPending = current.filter((image) => !pendingIds.includes(image.localId))
        const uploadedImages = payload.uploads.map((upload, index) =>
          imageFromUpload(
            upload,
            pendingImages[index]?.alt ?? "Image produit",
            withoutPending.length + index,
          ),
        )

        return normalizeImages([...withoutPending, ...uploadedImages])
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? friendlyUploadError(error.message)
          : "Aperçu local ajouté. La configuration Cloudinary sera nécessaire pour publier les images en production."
      const isLocalPreview =
        message.toLowerCase().includes("aperçu local") ||
        message.toLowerCase().includes("cloudinary")
      setUploadError(isLocalPreview ? "" : message)
      setImages((current) =>
        current.map((image) =>
          pendingImages.some((pending) => pending.localId === image.localId)
            ? {
                ...image,
                id: image.localId,
                url: image.previewUrl ?? image.url,
                uploading: false,
                error: isLocalPreview ? undefined : message,
              }
            : image,
        ),
      )
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    void uploadFiles(event.dataTransfer.files)
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void uploadFiles(event.target.files)
    }
  }

  function toggleStandardSize(size: ProductSize) {
    setSizes((current) => {
      if (current.some((item) => item.id === size.id)) {
        const next = current.filter((item) => item.id !== size.id)

        return next.length > 0 ? next : current
      }

      return [...current, size]
    })
  }

  function addCustomSize() {
    const label = customSize.trim()

    if (!label) {
      return
    }

    const id = slugify(label)
    setSizes((current) =>
      current.some((size) => size.id === id) ? current : [...current, { id, label }],
    )
    setCustomSize("")
  }

  function addCustomColor() {
    const name = newColorName.trim()

    if (!name) {
      return
    }

    const id = slugify(name)
    setColors((current) =>
      current.some((color) => color.id === id)
        ? current
        : [...current, { id, name, hex: newColorHex }],
    )
    setNewColorName("")
  }

  return (
    <section className="md:col-span-2">
      <input type="hidden" name="imagesJson" value={visibleImagesJson(images)} />
      <input type="hidden" name="sizesJson" value={sizesJson} />
      <input type="hidden" name="colorsJson" value={colorsJson} />
      <input type="hidden" name="variantsJson" value={variantsJson} />

      <div className="grid gap-6">
        <div className="grid gap-4 rounded-card border border-brand-border bg-white p-4">
          <div>
            <p className="text-base font-semibold text-brand-ink">Photos du produit</p>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              Glissez plusieurs photos, puis choisissez l'image principale en un clic.
            </p>
          </div>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="rounded-card border border-dashed border-brand-powder bg-brand-blush p-5 text-center"
          >
            <ImagePlus aria-hidden="true" className="mx-auto h-8 w-8 text-brand-plum" />
            <p className="mt-3 text-sm font-medium text-brand-ink">Glisser-déposer les photos</p>
            <p className="mt-1 text-xs text-brand-muted">ou sélectionner des fichiers</p>
            <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-card bg-brand-plum px-4 text-sm font-medium text-white transition hover:bg-brand-mauve focus-within:shadow-focus">
              <UploadCloud aria-hidden="true" className="h-4 w-4" />
              Choisir des images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="sr-only"
              />
            </label>
          </div>

          {uploadError ? (
            <p className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              {uploadError}
            </p>
          ) : null}

          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {normalizeImages(images).map((image, index) => (
                <article
                  key={image.localId}
                  className={cn(
                    "rounded-card border bg-white p-3",
                    index === 0 ? "border-brand-plum" : "border-brand-border",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-brand-blush">
                    {image.url || image.previewUrl ? (
                      <Image
                        src={image.url || image.previewUrl || ""}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, 280px"
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-brand-muted">
                        Image en attente
                      </div>
                    )}
                  </div>
                  {image.uploading ? (
                    <p className="mt-2 text-xs text-brand-muted">Téléversement en cours...</p>
                  ) : null}
                  {image.error ? <p className="mt-2 text-xs text-red-700">{image.error}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={index === 0 ? "secondary" : "outline"}
                      onClick={() =>
                        setImages((current) =>
                          normalizeImages([
                            image,
                            ...current.filter((item) => item.localId !== image.localId),
                          ]),
                        )
                      }
                      leftIcon={<Star aria-hidden="true" className="h-4 w-4" />}
                    >
                      Principale
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setImages((current) =>
                          normalizeImages(current.filter((item) => item.localId !== image.localId)),
                        )
                      }
                      leftIcon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                    >
                      Retirer
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-card border border-brand-border p-4 text-sm text-brand-muted">
              Aucune photo ajoutée. Une image valide sera demandée avant l'enregistrement final.
            </p>
          )}
        </div>

        <div className="grid gap-4 rounded-card border border-brand-border bg-white p-4">
          <div>
            <p className="text-base font-semibold text-brand-ink">Tailles disponibles</p>
            <p className="mt-1 text-sm text-brand-muted">
              Sélectionnez les tailles vendues pour ce modèle.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {standardSizes.map((size) => {
              const selected = selectedStandardSizeIds.has(size.id)

              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleStandardSize(size)}
                  className={cn(
                    "min-h-10 rounded-card border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:shadow-focus",
                    selected
                      ? "border-brand-plum bg-brand-plum text-white"
                      : "border-brand-border bg-white text-brand-ink hover:border-brand-plum",
                  )}
                >
                  {size.label}
                </button>
              )
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={customSize}
              onChange={(event) => setCustomSize(event.target.value)}
              placeholder="Ajouter une taille personnalisée"
              className="h-11 rounded-card border border-brand-border px-3 text-sm"
            />
            <Button type="button" variant="outline" onClick={addCustomSize}>
              Ajouter
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-card border border-brand-border bg-white p-4">
          <div>
            <p className="text-base font-semibold text-brand-ink">Couleurs</p>
            <p className="mt-1 text-sm text-brand-muted">
              Ajoutez les teintes visibles par les clientes.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <input
              value={newColorName}
              onChange={(event) => setNewColorName(event.target.value)}
              placeholder="Nom de la couleur"
              className="h-11 rounded-card border border-brand-border px-3 text-sm"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(event) => setNewColorHex(event.target.value)}
              aria-label="Teinte"
              className="h-11 w-full rounded-card border border-brand-border bg-white px-2"
            />
            <Button type="button" variant="outline" onClick={addCustomColor}>
              Ajouter
            </Button>
          </div>
          {colors.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="flex items-center gap-3 rounded-card border border-brand-border p-3"
                >
                  <input
                    type="color"
                    value={color.hex ?? "#E9B7C5"}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item) =>
                          item.id === color.id ? { ...item, hex: event.target.value } : item,
                        ),
                      )
                    }
                    aria-label={`Teinte ${color.name}`}
                    className="h-10 w-12 rounded-card border border-brand-border bg-white"
                  />
                  <input
                    value={color.name}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item) =>
                          item.id === color.id ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                    className="h-10 min-w-0 flex-1 rounded-card border border-brand-border px-3 text-sm"
                    aria-label="Nom de la couleur"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setColors((current) => current.filter((item) => item.id !== color.id))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-card text-brand-muted transition hover:bg-brand-blush hover:text-brand-plum focus-visible:outline-none focus-visible:shadow-focus"
                    aria-label={`Retirer ${color.name}`}
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-card border border-brand-border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-brand-ink">
              <span className="mb-2 block">Référence unique</span>
              <input
                name="sku"
                value={baseSku}
                onChange={(event) => setBaseSku(event.target.value)}
                required
                className="h-11 w-full rounded-card border border-brand-border px-3 text-sm"
              />
            </label>
          </div>
          <div>
            <p className="text-base font-semibold text-brand-ink">Stock par variante</p>
            <p className="mt-1 text-sm text-brand-muted">
              Les variantes sont générées automatiquement à partir des tailles et couleurs.
            </p>
          </div>
          <div className="grid gap-3">
            {variants.map((variant) => {
              const size = sizes.find((item) => item.id === variant.sizeId)
              const color = colors.find((item) => item.id === variant.colorId)

              return (
                <label
                  key={variant.id}
                  className="grid gap-3 rounded-card border border-brand-border p-3 sm:grid-cols-[1fr_140px_150px]"
                >
                  <span className="text-sm font-medium text-brand-ink">
                    {[size?.label, color?.name].filter(Boolean).join(" / ") || "Variante"}
                    <span className="mt-1 block text-xs font-normal text-brand-muted">
                      {variant.sku}
                    </span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(event) =>
                      setStockByVariant((current) => ({
                        ...current,
                        [variant.id]: Math.max(0, Number.parseInt(event.target.value, 10) || 0),
                      }))
                    }
                    className="h-11 rounded-card border border-brand-border px-3 text-sm disabled:bg-brand-blush"
                    aria-label="Stock"
                  />
                  <select
                    value={variant.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as ProductVariant["status"]
                      setStatusByVariant((current) => ({
                        ...current,
                        [variant.id]: nextStatus,
                      }))
                    }}
                    className="h-11 rounded-card border border-brand-border bg-white px-3 text-sm"
                    aria-label="Statut de la variante"
                  >
                    <option value="active">En stock</option>
                    <option value="inactive">Rupture</option>
                  </select>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
