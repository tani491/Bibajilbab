import "server-only"

import { unstable_cache } from "next/cache"

import { getOptimizedCloudinaryImageSrc } from "@bibajilbab/config"
import {
  categorySchema,
  productImageSchema,
  productSchema,
  testimonialSchema,
} from "@bibajilbab/types"
import type { ProductImage } from "@bibajilbab/types"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "./firebase/admin"
import {
  categories as fallbackCategories,
  type StoreCategory,
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
  logoUrl?: string
}

export interface StorefrontTestimonial {
  id: string
  authorName: string
  city?: string
  rating: number
  content: string
  verifiedPurchase: boolean
  createdAt: string
  orderIndex: number
}

function categoryFallbackImage(
  category: Pick<StoreCategory, "id" | "slug" | "imageSrc">,
  products: StoreProduct[],
): string {
  return (
    category.imageSrc ||
    products.find(
      (product) => product.categorySlug === category.id || product.categorySlug === category.slug,
    )?.images[0]?.src ||
    ""
  )
}

function fallbackStorefrontCategories(products: StoreProduct[]): StoreCategory[] {
  return fallbackCategories.map((category) => ({
    ...category,
    imageSrc: categoryFallbackImage(category, products),
  }))
}

function toStoreCategory(
  documentId: string,
  data: Record<string, unknown>,
  products: StoreProduct[],
): StoreCategory | null {
  const name = typeof data.name === "string" && data.name.trim() ? data.name.trim() : documentId
  const slug = typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : documentId
  const status =
    data.status === "draft" || data.status === "published" || data.status === "archived"
      ? data.status
      : "published"
  const normalizedImage = normalizeImageCandidate(data.image, name, 0)
  const now = new Date(0).toISOString()
  const candidate = {
    ...data,
    id: documentId,
    name,
    slug,
    description: typeof data.description === "string" ? data.description : "",
    ...(normalizedImage ? { image: normalizedImage } : {}),
    position: typeof data.position === "number" ? data.position : 0,
    status,
    seo: data.seo,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? data.createdAt ?? now,
  }
  const parsed = categorySchema.safeParse(candidate)

  if (!parsed.success || parsed.data.status !== "published") {
    return null
  }

  const imageSrc = parsed.data.image?.url
    ? (getOptimizedCloudinaryImageSrc(parsed.data.image.url) ?? parsed.data.image.url)
    : ""

  return {
    id: documentId,
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description ?? "",
    imageSrc:
      imageSrc ||
      categoryFallbackImage({ id: documentId, slug: parsed.data.slug, imageSrc }, products),
    imageAlt: parsed.data.image?.alt ?? `${parsed.data.name} - BibaJilbab`,
    position: parsed.data.position,
  }
}

function sortStoreCategories(categories: StoreCategory[]): StoreCategory[] {
  return [...categories].sort((left, right) => {
    const positionDiff = (left.position ?? 0) - (right.position ?? 0)

    return positionDiff || left.name.localeCompare(right.name, "fr")
  })
}

export async function getStorefrontCategories(
  products: StoreProduct[] = [],
): Promise<StoreCategory[]> {
  if (!getFirebaseAdminStatus().available) {
    return fallbackStorefrontCategories(products)
  }

  try {
    const snapshot = await getFirebaseAdminFirestore().collection("categories").get()
    const categories = snapshot.docs
      .map((document) => toStoreCategory(document.id, document.data(), products))
      .filter((category): category is StoreCategory => category !== null)

    return sortStoreCategories(categories)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Storefront Categories Firestore Error]", error)
    }

    return fallbackStorefrontCategories(products)
  }
}

export async function getStorefrontCategoryBySlug(
  slug: string,
  products: StoreProduct[] = [],
): Promise<StoreCategory | undefined> {
  const categories = await getStorefrontCategories(products)

  return categories.find((category) => category.slug === slug || category.id === slug)
}

function mapImage(image: ProductImage): StoreProductImage {
  return {
    src: getOptimizedCloudinaryImageSrc(image.url) ?? image.url,
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
  let displayImages: ProductImage[] = []
  const normalizedValue = source
    ? {
        ...source,
        status:
          !("status" in source) || source.status === "active" || source.status === "published"
            ? "published"
            : source.status,
      }
    : value
  const candidate =
    normalizedValue && typeof normalizedValue === "object"
      ? (() => {
          const productRecord = normalizedValue as Record<string, unknown>
          const name =
            typeof productRecord.name === "string" ? productRecord.name : "Produit BibaJilbab"
          const rawImages = Array.isArray(productRecord.images)
            ? productRecord.images
            : [productRecord.coverImage, productRecord.imageUrl].filter(Boolean)
          displayImages = rawImages
            .map((image, position) => normalizeImageCandidate(image, name, position))
            .filter((image): image is Record<string, unknown> => Boolean(image))
            .flatMap((image) => {
              const parsed = productImageSchema.safeParse(image)

              return parsed.success ? [parsed.data] : []
            })

          return {
            ...productRecord,
            collectionIds: Array.isArray(productRecord.collectionIds)
              ? productRecord.collectionIds
              : Array.isArray(productRecord.collectionSlugs)
                ? productRecord.collectionSlugs
                : [],
            tags: Array.isArray(productRecord.tags) ? productRecord.tags : [],
            images: displayImages.map((image) => image.url),
            sizes: Array.isArray(productRecord.sizes) ? productRecord.sizes : [],
            colors: Array.isArray(productRecord.colors) ? productRecord.colors : [],
            variants: Array.isArray(productRecord.variants) ? productRecord.variants : [],
            currency: productRecord.currency ?? "XOF",
            featured: productRecord.featured ?? false,
            seo: productRecord.seo ?? {
              metaTitle: name,
              metaDescription:
                typeof productRecord.shortDescription === "string"
                  ? productRecord.shortDescription
                  : "Collection BibaJilbab",
              noIndex: false,
            },
            createdAt: productRecord.createdAt ?? new Date(0).toISOString(),
            updatedAt:
              productRecord.updatedAt ?? productRecord.createdAt ?? new Date(0).toISOString(),
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
    images: [...displayImages].sort((left, right) => left.position - right.position).map(mapImage),
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

function toStorefrontTestimonial(value: unknown): StorefrontTestimonial | null {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : null

  if (!source) {
    return null
  }

  const sourceId = typeof source.id === "string" ? source.id : undefined
  const authorName =
    typeof source.authorName === "string" && source.authorName.trim()
      ? source.authorName.trim()
      : typeof source.customerName === "string" && source.customerName.trim()
        ? source.customerName.trim()
        : "Cliente BibaJilbab"
  const city =
    typeof source.city === "string" && source.city.trim() ? source.city.trim() : undefined
  const rating =
    typeof source.rating === "number" && Number.isInteger(source.rating) ? source.rating : 5
  const isPublished =
    typeof source.isPublished === "boolean"
      ? source.isPublished
      : source.status === "published" || source.status === "active"
  const orderIndex =
    typeof source.orderIndex === "number"
      ? source.orderIndex
      : typeof source.position === "number"
        ? source.position
        : 0
  const createdAt = source.createdAt ?? new Date(0).toISOString()
  const candidate = {
    ...source,
    id: sourceId,
    authorName,
    ...(city ? { city } : {}),
    rating,
    content: typeof source.content === "string" ? source.content : "",
    verifiedPurchase: source.verifiedPurchase === true,
    isPublished,
    orderIndex,
    createdAt,
    updatedAt: source.updatedAt ?? createdAt,
  }
  const parsed = testimonialSchema.safeParse(candidate)

  if (!parsed.success || !parsed.data.isPublished) {
    return null
  }

  return {
    id: parsed.data.id ?? authorName,
    authorName: parsed.data.authorName,
    ...(parsed.data.city ? { city: parsed.data.city } : {}),
    rating: parsed.data.rating,
    content: parsed.data.content,
    verifiedPurchase: parsed.data.verifiedPurchase,
    createdAt: toIsoString(parsed.data.createdAt),
    orderIndex: parsed.data.orderIndex ?? 0,
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

async function fetchStorefrontProducts(status: "published" | "active"): Promise<StoreProduct[]> {
  try {
    const snapshot = await getFirebaseAdminFirestore().collection("products").get()
    const products = snapshot.docs
      .map((document) => {
        const value = { id: document.id, ...document.data() }
        const product = toStoreProduct(value)

        return product
      })
      .filter((product): product is StoreProduct => product !== null)
      .filter((product) => status === "active" || product.status === status)

    return products
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Storefront Firestore Error]", error)
    }
    return []
  }
}

const getPublishedProductsCached = unstable_cache(
  () => fetchStorefrontProducts("published"),
  ["storefront-products-published"],
  { revalidate: 60, tags: ["storefront-products"] },
)

const getActiveProductsCached = unstable_cache(
  () => fetchStorefrontProducts("active"),
  ["storefront-products-active"],
  { revalidate: 60, tags: ["storefront-products"] },
)

export async function getStorefrontProducts({
  status = "published",
}: { status?: "published" | "active" } = {}): Promise<StoreProduct[]> {
  return status === "active" ? getActiveProductsCached() : getPublishedProductsCached()
}

export async function getStorefrontProductBySlug(slug: string): Promise<StoreProduct | undefined> {
  const products = await getStorefrontProducts({ status: "published" })
  return products.find((product) => product.slug === slug)
}

async function fetchStorefrontHero(): Promise<StorefrontHero | null> {
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
        : typeof referencedMedia?.kind === "string" &&
            referencedMedia.kind === "video" &&
            typeof referencedMedia.url === "string"
          ? referencedMedia.url
          : typeof settingsMedia?.kind === "string" &&
              settingsMedia.kind === "video" &&
              typeof settingsMedia.url === "string"
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
      imageUrl:
        typeof media?.url === "string"
          ? (getOptimizedCloudinaryImageSrc(media.url) ?? media.url)
          : "",
      imageAlt: typeof media?.alt === "string" ? media.alt : "Collection BibaJilbab",
      ...(videoUrl ? { videoUrl } : {}),
    }
  } catch {
    return null
  }
}

const getStorefrontHeroCached = unstable_cache(fetchStorefrontHero, ["storefront-hero"], {
  revalidate: 60,
  tags: ["storefront-homepage"],
})

export async function getStorefrontHero(): Promise<StorefrontHero | null> {
  return getStorefrontHeroCached()
}

async function fetchStorefrontTestimonials(): Promise<StorefrontTestimonial[]> {
  try {
    const snapshot = await getFirebaseAdminFirestore()
      .collection("testimonials")
      .where("isPublished", "==", true)
      .get()
    const testimonials = snapshot.docs
      .map((document) => toStorefrontTestimonial({ id: document.id, ...document.data() }))
      .filter((testimonial): testimonial is StorefrontTestimonial => testimonial !== null)

    return testimonials.sort((left, right) => {
      if (left.orderIndex !== right.orderIndex) {
        return left.orderIndex - right.orderIndex
      }

      return right.createdAt.localeCompare(left.createdAt)
    })
  } catch {
    return []
  }
}

const getStorefrontTestimonialsCached = unstable_cache(
  fetchStorefrontTestimonials,
  ["storefront-testimonials-published"],
  {
    revalidate: 60,
    tags: ["storefront-testimonials"],
  },
)

export async function getStorefrontTestimonials(): Promise<StorefrontTestimonial[]> {
  return getStorefrontTestimonialsCached()
}

async function fetchStorefrontAnnouncement(): Promise<StorefrontAnnouncement | null> {
  try {
    const db = getFirebaseAdminFirestore()
    const document = await db.collection("siteSettings").doc("default").get()
    const generalDocument = await db.collection("settings").doc("general").get()
    const settings = generalDocument.exists ? generalDocument.data() : document.data()
    const announcement = settings?.announcement
    const logoUrl = settings?.logoUrl

    if (
      (!document.exists && !generalDocument.exists) ||
      ((typeof announcement !== "string" || !announcement.trim()) &&
        (typeof logoUrl !== "string" || !logoUrl.trim()))
    ) {
      return null
    }

    return {
      text:
        typeof announcement === "string" && announcement.trim()
          ? announcement.trim()
          : "Bienvenue chez BibaJilbab",
      href: "/catalogue",
      ...(typeof logoUrl === "string" && logoUrl.trim() ? { logoUrl: logoUrl.trim() } : {}),
    }
  } catch {
    return null
  }
}

const getStorefrontAnnouncementCached = unstable_cache(
  fetchStorefrontAnnouncement,
  ["storefront-announcement"],
  {
    revalidate: 60,
    tags: ["storefront-settings"],
  },
)

export async function getStorefrontAnnouncement(): Promise<StorefrontAnnouncement | null> {
  return getStorefrontAnnouncementCached()
}
