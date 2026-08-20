import "server-only"

import { productSchema } from "@bibajilbab/types"

import { getFirebaseAdminFirestore } from "./firebase/admin"
import {
  type StoreProduct,
  type StoreProductImage,
} from "./catalog"

export interface StorefrontHero {
  eyebrow: string
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  imageAlt: string
  videoUrl?: string
}

export interface StorefrontAnnouncement {
  text: string
  href: string
}

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

export async function getStorefrontProducts({
  status = "published",
}: { status?: "published" } = {}): Promise<StoreProduct[]> {
  try {
    const snapshot = await getFirebaseAdminFirestore()
      .collection("products")
      .where("status", "==", status)
      .get()
    const products = snapshot.docs
      .map((document) => toStoreProduct({ id: document.id, ...document.data() }))
      .filter((product): product is StoreProduct => product !== null)

    return products
  } catch {
    return []
  }
}

export async function getStorefrontProductBySlug(slug: string): Promise<StoreProduct | undefined> {
  const products = await getStorefrontProducts({ status: "published" })
  return products.find((product) => product.slug === slug)
}

export async function getStorefrontHero(): Promise<StorefrontHero | null> {
  try {
    const document = await getFirebaseAdminFirestore()
      .collection("homepageSections")
      .doc("main-hero")
      .get()

    if (!document.exists) {
      return null
    }

    const data = document.data() as {
      eyebrow?: unknown
      title?: unknown
      body?: unknown
      ctaLabel?: unknown
      ctaHref?: unknown
      heroDesktopMedia?: { url?: unknown; alt?: unknown }
      heroMobileMedia?: { url?: unknown; alt?: unknown }
      heroVideoUrl?: unknown
      status?: unknown
    }
    const media = data.heroDesktopMedia ?? data.heroMobileMedia
    const videoUrl = typeof data.heroVideoUrl === "string" ? data.heroVideoUrl : undefined

    if (data.status !== "published" || (typeof media?.url !== "string" && !videoUrl)) {
      return null
    }

    return {
      eyebrow: typeof data.eyebrow === "string" ? data.eyebrow : "BibaJilbab Sénégal",
      title: typeof data.title === "string" ? data.title : "L'élégance dans la pudeur",
      body:
        typeof data.body === "string"
          ? data.body
          : "Découvrez nos djilbabs, khimars, tuniques et tenues de prière.",
      ctaLabel: typeof data.ctaLabel === "string" ? data.ctaLabel : "Découvrir la collection",
      ctaHref: typeof data.ctaHref === "string" ? data.ctaHref : "/catalogue",
      imageUrl: typeof media?.url === "string" ? media.url : "",
      imageAlt: typeof media?.alt === "string" ? media.alt : "Collection BibaJilbab",
      videoUrl,
    }
  } catch {
    return null
  }
}

export async function getStorefrontAnnouncement(): Promise<StorefrontAnnouncement | null> {
  try {
    const document = await getFirebaseAdminFirestore()
      .collection("siteSettings")
      .doc("default")
      .get()
    const announcement = document.data()?.announcement

    if (!document.exists || typeof announcement !== "string" || !announcement.trim()) {
      return null
    }

    return { text: announcement.trim(), href: "/catalogue" }
  } catch {
    return null
  }
}
