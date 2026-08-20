import "server-only"

import { productSchema } from "@bibajilbab/types"

import { getFirebaseAdminFirestore } from "./firebase/admin"
import {
  getPublishedProducts,
  products as demoProducts,
  type StoreProduct,
  type StoreProductImage,
} from "./catalog"

function mapImage(image: {
  url: string
  alt: string
  width?: number
  height?: number
}): StoreProductImage {
  return {
    src: image.url,
    alt: image.alt,
    width: image.width ?? 1200,
    height: image.height ?? 1500,
  }
}

function toStoreProduct(value: unknown): StoreProduct | null {
  const parsed = productSchema.safeParse(value)

  if (!parsed.success || parsed.data.status !== "published") {
    return null
  }

  const product = parsed.data

  return {
    id: product.id ?? product.slug,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    categorySlug: product.categoryId,
    collectionSlugs: product.collectionIds,
    tags: product.tags,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    price: product.price,
    currency: product.currency,
    badge: product.badge,
    featured: product.featured,
    previewRank: 0,
    status: product.status,
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    images: product.images.sort((left, right) => left.position - right.position).map(mapImage),
    sizes: product.sizes,
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex ?? "#111111",
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      sizeId: variant.sizeId,
      colorId: variant.colorId,
      stock: variant.stock,
    })),
    createdAt: toIsoString(product.createdAt),
    updatedAt: toIsoString(product.updatedAt),
    seo: {
      title: product.seo.metaTitle,
      description: product.seo.metaDescription,
    },
  }
}

function toIsoString(value: string | Date | { seconds: number; nanoseconds: number }): string {
  if (typeof value === "string") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date(value.seconds * 1000 + Math.floor(value.nanoseconds / 1_000_000)).toISOString()
}

export async function getStorefrontProducts(): Promise<StoreProduct[]> {
  try {
    const snapshot = await getFirebaseAdminFirestore().collection("products").get()
    const products = snapshot.docs
      .map((document) => toStoreProduct({ id: document.id, ...document.data() }))
      .filter((product): product is StoreProduct => product !== null)

    return products.length > 0 ? products : getPublishedProducts()
  } catch {
    return demoProducts.filter((product) => product.status === "published")
  }
}

export async function getStorefrontProductBySlug(slug: string): Promise<StoreProduct | undefined> {
  const products = await getStorefrontProducts()
  return products.find((product) => product.slug === slug)
}
