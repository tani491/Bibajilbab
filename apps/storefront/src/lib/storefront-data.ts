import "server-only"

import { productImageSchema, productSchema } from "@bibajilbab/types"
import type { ProductImage } from "@bibajilbab/types"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "./firebase/admin"
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

function mapImage(image: ProductImage): StoreProductImage {
  return {
    src: image.url,
    alt: image.alt,
    width: typeof image.width === "number" ? image.width : 1200,
    height: typeof image.height === "number" ? image.height : 1500,
  }
}

function normalizeImageCandidate(value: unknown, fallbackAlt: string, position: number): unknown {
  if (typeof value === "string") {
    return { url: value, alt: fallbackAlt, position }
  }

  if (!value || typeof value !== "object") {
    return null
  }

  const image = value as Record<string, unknown>
  const url =
    typeof image.url === "string"
      ? image.url
      : typeof image.secure_url === "string"
        ? image.secure_url
        : typeof image.src === "string"
          ? image.src
          : undefined

  return url
    ? {
        ...image,
        url,
        alt: typeof image.alt === "string" && image.alt.trim() ? image.alt : fallbackAlt,
        position: typeof image.position === "number" ? image.position : position,
      }
    : null
}

function toStoreProduct(value: unknown): StoreProduct | null {
  const source = value && typeof value === "object" ? value : null
  const normalizedValue =
    source && "status" in source && (source.status === "active" || source.status === "published")
      ? { ...source, status: "published" }
      : value
  const candidate = normalizedValue && typeof normalizedValue === "object"
    ? (() => {
        const productRecord = normalizedValue as Record<string, unknown>
        const name = typeof productRecord.name === "string" ? productRecord.name : "Produit BibaJilbab"
        const rawImages = Array.isArray(productRecord.images)
          ? productRecord.images
          : [productRecord.coverImage, productRecord.imageUrl].filter(Boolean)
        const images = rawImages
          .map((image, position) => normalizeImageCandidate(image, name, position))
          .filter((image): image is Record<string, unknown> => Boolean(image))
          .filter((image) => productImageSchema.safeParse(image).success)

        return {
        ...productRecord,
        collectionIds: Array.isArray(productRecord.collectionIds)
          ? productRecord.collectionIds
          : Array.isArray(productRecord.collectionSlugs)
            ? productRecord.collectionSlugs
            : [],
        tags: Array.isArray(productRecord.tags) ? productRecord.tags : [],
        images,
        sizes: Array.isArray(productRecord.sizes) ? productRecord.sizes : [],
        colors: Array.isArray(productRecord.colors) ? productRecord.colors : [],
        variants: Array.isArray(productRecord.variants) ? productRecord.variants : [],
        currency: productRecord.currency ?? "XOF",
        featured: productRecord.featured ?? false,
        seo: productRecord.seo ?? {
          metaTitle: name,
          metaDescription: typeof productRecord.shortDescription === "string" ? productRecord.shortDescription : "Collection BibaJilbab",
          noIndex: false,
        },
        createdAt: productRecord.createdAt ?? new Date(0).toISOString(),
        updatedAt: productRecord.updatedAt ?? productRecord.createdAt ?? new Date(0).toISOString(),
        }
      })()
    : normalizedValue
  const parsed = productSchema.safeParse(candidate)

  if (!parsed.success) {
    if (source && "id" in source) {
      console.error("[storefront] Produit Firestore invalide", {
        id: source.id,
        issues: parsed.error.issues.map((issue) => issue.path.join(".") || "root"),
      })
    }

    return null
  }

  if (parsed.data.status !== "published") {
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
    ...(product.badge ? { badge: product.badge } : {}),
    featured: product.featured,
    previewRank: 0,
    status: product.status,
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    images: [...product.images].sort((left, right) => left.position - right.position).map(mapImage),
    sizes: product.sizes.map((size) => ({
      id: size.id,
      label: size.label,
      ...(size.description ? { description: size.description } : {}),
    })),
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex ?? "#111111",
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      ...(variant.sizeId ? { sizeId: variant.sizeId } : {}),
      ...(variant.colorId ? { colorId: variant.colorId } : {}),
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
}: { status?: "published" | "active" } = {}): Promise<StoreProduct[]> {
  try {
    const firebaseStatus = getFirebaseAdminStatus()
    console.log("[Storefront] Firebase source:", firebaseStatus)
    const snapshot = await getFirebaseAdminFirestore().collection("products").get()
    console.log("[Storefront] Raw Firestore docs found:", snapshot.docs.length)
    const products = snapshot.docs
      .map((document) => {
        const value = { id: document.id, ...document.data() }
        const product = toStoreProduct(value)

        if (!product || (status === "active" && product.status !== "published")) {
          console.error(`[storefront] Produit Firestore ignore: ${document.id}`)
        }

        return product
      })
      .filter((product): product is StoreProduct => product !== null)

    console.log("[Storefront] Published products accepted:", products.length)
    return products
  } catch (error) {
    console.error("[storefront] Lecture Firestore products impossible", {
      error,
      firebase: getFirebaseAdminStatus(),
    })
    return []
  }
}

export async function getStorefrontProductBySlug(slug: string): Promise<StoreProduct | undefined> {
  const products = await getStorefrontProducts({ status: "published" })
  return products.find((product) => product.slug === slug)
}

export async function getStorefrontHero(): Promise<StorefrontHero | null> {
  try {
    const db = getFirebaseAdminFirestore()
    const document = await db.collection("homepageSections").doc("main-hero").get()

    const data = (document.exists ? document.data() : {}) as {
      eyebrow?: unknown
      title?: unknown
      body?: unknown
      ctaLabel?: unknown
      ctaHref?: unknown
      heroDesktopMedia?: { url?: unknown; alt?: unknown }
      heroMobileMedia?: { url?: unknown; alt?: unknown }
      heroVideoUrl?: unknown
      mediaId?: unknown
      status?: unknown
    }
    const mediaId = typeof data.mediaId === "string" ? data.mediaId : undefined
    const mediaDocument = mediaId ? await db.collection("media").doc(mediaId).get() : null
    const referencedMedia = mediaDocument?.exists ? mediaDocument.data() : undefined
    const settingsDocument = await db.collection("siteSettings").doc("default").get()
    const settings = settingsDocument.exists ? settingsDocument.data() : undefined
    const settingsMediaId =
      typeof settings?.heroDesktopMediaId === "string"
        ? settings.heroDesktopMediaId
        : typeof settings?.heroMobileMediaId === "string"
          ? settings.heroMobileMediaId
          : undefined
    const settingsMediaDocument = settingsMediaId
      ? await db.collection("media").doc(settingsMediaId).get()
      : null
    const settingsMedia = settingsMediaDocument?.exists ? settingsMediaDocument.data() : undefined
    const media =
      data.heroDesktopMedia ??
      data.heroMobileMedia ??
      (referencedMedia as { url?: unknown; alt?: unknown } | undefined) ??
      (settingsMedia as { url?: unknown; alt?: unknown } | undefined)
    const videoUrl =
      typeof data.heroVideoUrl === "string"
        ? data.heroVideoUrl
        : typeof referencedMedia?.kind === "string" && referencedMedia.kind === "video" && typeof referencedMedia.url === "string"
          ? referencedMedia.url
          : typeof settingsMedia?.kind === "string" && settingsMedia.kind === "video" && typeof settingsMedia.url === "string"
            ? settingsMedia.url
            : undefined
    const status = data.status ?? referencedMedia?.status ?? settingsMedia?.status

    if (
      (!document.exists && !mediaDocument?.exists && !settingsMediaDocument?.exists) ||
      (status !== undefined && status !== "published" && status !== "active") ||
      (typeof media?.url !== "string" && !videoUrl)
    ) {
      return null
    }

    return {
      eyebrow:
        typeof data.eyebrow === "string"
          ? data.eyebrow
          : typeof settings?.heroEyebrow === "string"
            ? settings.heroEyebrow
            : "BibaJilbab Sénégal",
      title:
        typeof data.title === "string"
          ? data.title
          : typeof settings?.heroTitle === "string"
            ? settings.heroTitle
            : "L'élégance dans la pudeur",
      body:
        typeof data.body === "string"
          ? data.body
          : typeof settings?.heroDescription === "string"
            ? settings.heroDescription
            : "Découvrez nos djilbabs, khimars, tuniques et tenues de prière.",
      ctaLabel: typeof data.ctaLabel === "string" ? data.ctaLabel : "Découvrir la collection",
      ctaHref: typeof data.ctaHref === "string" ? data.ctaHref : "/catalogue",
      imageUrl: typeof media?.url === "string" ? media.url : "",
      imageAlt: typeof media?.alt === "string" ? media.alt : "Collection BibaJilbab",
      ...(videoUrl ? { videoUrl } : {}),
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
