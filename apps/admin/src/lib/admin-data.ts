import "server-only"

import type { QueryDocumentSnapshot } from "firebase-admin/firestore"
import type { Product, ProductImage } from "@bibajilbab/types"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "@/lib/firebase/admin"

import type { AdminRole } from "./permissions"

export interface AdminProductRow {
  id: string
  name: string
  slug: string
  sku: string
  status: "draft" | "published" | "archived"
  price: number
  featured: boolean
  categoryId: string
  stock: number
  variants: AdminInventoryVariant[]
  updatedAt: string
}

export interface AdminInventoryVariant {
  id: string
  sku: string
  stock: number
  lowStockThreshold: number
  status: "active" | "inactive"
}

export interface AdminCategoryRow {
  id: string
  name: string
  slug: string
  description?: string | undefined
  status: "draft" | "published" | "archived"
  position: number
}

export interface AdminCollectionRow extends AdminCategoryRow {
  type: "permanent" | "tabaski" | "korite" | "seasonal"
  startsAt?: string | undefined
  endsAt?: string | undefined
}

export interface AdminMediaRow {
  id: string
  url: string
  alt: string
  status: "draft" | "published" | "archived"
  usage?: string | undefined
}

export interface AdminRequestRow {
  id: string
  createdAt: string
  customerName: string
  phone: string
  city?: string | undefined
  subtotal: number
  status: string
}

export interface AdminUserRow {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  status: "active" | "disabled"
  lastLoginAt?: string | undefined
}

export interface AdminHomepageSectionRow {
  id: string
  kind: string
  title: string
  status: "draft" | "published" | "archived"
  position: number
}

export interface AdminMainHeroSection {
  id: string
  title?: string | undefined
  eyebrow?: string | undefined
  body?: string | undefined
  ctaLabel?: string | undefined
  productIds: string[]
  heroDesktopMedia?: ProductImage | undefined
  heroMobileMedia?: ProductImage | undefined
  heroVideoUrl?: string | undefined
}

export interface AdminFaqRow {
  id: string
  question: string
  status: "draft" | "published" | "archived"
  position: number
}

export interface AdminTestimonialRow {
  id: string
  authorName: string
  city?: string | undefined
  rating: number
  content: string
  verifiedPurchase: boolean
  isPublished: boolean
  createdAt: string
  orderIndex: number
}

export interface DashboardData {
  products: number
  publishedProducts: number
  drafts: number
  outOfStock: number
  lowStock: number
  categories: number
  collections: number
  productViews: number
  totalVisits: number
  cartAdds: number
  favoriteAdds: number
  whatsappClicks: number
  whatsappRequests: number
  trafficSources: Array<{ source: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  recentlyModified: Array<{ id: string; label: string; collection: string; updatedAt: string }>
}

function toPlain<T>(snapshot: QueryDocumentSnapshot): T & { id: string } {
  return { id: snapshot.id, ...(snapshot.data() as T) }
}

function dateLabel(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate()
    return date.toISOString()
  }

  return new Date().toISOString()
}

function productStock(product: { variants?: unknown }): number {
  if (!Array.isArray(product.variants)) {
    return 0
  }

  return product.variants.reduce((total, variant) => {
    if (
      variant &&
      typeof variant === "object" &&
      typeof (variant as { stock?: unknown }).stock === "number"
    ) {
      return total + (variant as { stock: number }).stock
    }

    return total
  }, 0)
}

function productVariants(product: { variants?: unknown }): AdminInventoryVariant[] {
  if (!Array.isArray(product.variants)) {
    return []
  }

  return product.variants
    .map((variant) => {
      if (!variant || typeof variant !== "object") {
        return null
      }

      const item = variant as {
        id?: unknown
        sku?: unknown
        stock?: unknown
        lowStockThreshold?: unknown
        status?: unknown
      }

      if (typeof item.id !== "string") {
        return null
      }

      return {
        id: item.id,
        sku: typeof item.sku === "string" ? item.sku : item.id,
        stock: typeof item.stock === "number" ? item.stock : 0,
        lowStockThreshold: typeof item.lowStockThreshold === "number" ? item.lowStockThreshold : 0,
        status: item.status === "inactive" ? "inactive" : "active",
      }
    })
    .filter((variant): variant is AdminInventoryVariant => variant !== null)
}

function productLowStock(product: { variants?: unknown }): boolean {
  if (!Array.isArray(product.variants)) {
    return false
  }

  return product.variants.some((variant) => {
    if (!variant || typeof variant !== "object") {
      return false
    }

    const item = variant as { stock?: unknown; lowStockThreshold?: unknown }

    return (
      typeof item.stock === "number" &&
      typeof item.lowStockThreshold === "number" &&
      item.stock > 0 &&
      item.stock <= item.lowStockThreshold
    )
  })
}

interface AnalyticsSummary {
  totalVisits: number
  productViews: number
  cartAdds: number
  favoriteAdds: number
  whatsappClicks: number
  trafficSources: Array<{ source: string; count: number }>
  topPages: Array<{ path: string; count: number }>
}

function sourceFromMetadata(metadata: unknown): string {
  if (!metadata || typeof metadata !== "object") {
    return "Accès direct"
  }

  const source = (metadata as Record<string, unknown>).source

  return typeof source === "string" && source.trim() ? source : "Accès direct"
}

function pathFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null
  }

  const record = metadata as Record<string, unknown>
  const path = typeof record.path === "string" ? record.path : undefined
  const url = typeof record.url === "string" ? record.url : undefined

  return path ?? url ?? null
}

function eventNameFromData(data: Record<string, unknown>, collection: string): string {
  if (typeof data.name === "string") {
    return data.name
  }

  return collection === "page_views" ? "page_view" : ""
}

function metadataFromData(data: Record<string, unknown>): Record<string, unknown> {
  const metadata = data.metadata

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>
  }

  return data
}

function topCounts(map: Map<string, number>, limit: number) {
  return Array.from(map, ([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key))
    .slice(0, limit)
}

async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (!getFirebaseAdminStatus().available) {
    return {
      totalVisits: 0,
      productViews: 0,
      cartAdds: 0,
      favoriteAdds: 0,
      whatsappClicks: 0,
      trafficSources: [],
      topPages: [],
    }
  }

  const db = getFirebaseAdminFirestore()
  const analyticsCollections = ["analytics", "analyticsEvents", "page_views"]
  const snapshots = await Promise.all(
    analyticsCollections.map(async (collection) => ({
      collection,
      snapshot: await db.collection(collection).limit(500).get(),
    })),
  )
  const sources = new Map<string, number>()
  const pages = new Map<string, number>()
  let totalVisits = 0
  let productViews = 0
  let cartAdds = 0
  let favoriteAdds = 0
  let whatsappClicks = 0

  snapshots.forEach(({ collection, snapshot }) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const metadata = metadataFromData(data)
      const name = eventNameFromData(data, collection)
      const source = sourceFromMetadata(metadata)
      const path = pathFromMetadata(metadata)

      sources.set(source, (sources.get(source) ?? 0) + 1)

      if (name === "page_view" || name === "product_view") {
        totalVisits += 1
      }

      if ((name === "page_view" || name === "product_view") && path) {
        pages.set(path, (pages.get(path) ?? 0) + 1)
      }

      if (name === "product_view") productViews += 1
      if (name === "cart_add") cartAdds += 1
      if (name === "favorite_add") favoriteAdds += 1
      if (name === "whatsapp_click") whatsappClicks += 1
    })
  })

  return {
    totalVisits,
    productViews,
    cartAdds,
    favoriteAdds,
    whatsappClicks,
    trafficSources: topCounts(sources, 5).map(({ key, count }) => ({ source: key, count })),
    topPages: topCounts(pages, 5).map(({ key, count }) => ({ path: key, count })),
  }
}

export async function listProducts(): Promise<AdminProductRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("products").limit(200).get()

  return snapshot.docs.map((doc) => {
    const product = toPlain<{
      name?: string
      slug?: string
      sku?: string
      status?: AdminProductRow["status"]
      price?: number
      featured?: boolean
      categoryId?: string
      variants?: unknown
      updatedAt?: unknown
    }>(doc)

    return {
      id: product.id,
      name: product.name ?? "Produit sans nom",
      slug: product.slug ?? product.id,
      sku: product.sku ?? "N/A",
      status: product.status ?? "draft",
      price: product.price ?? 0,
      featured: product.featured ?? false,
      categoryId: product.categoryId ?? "non-classe",
      stock: productStock(product),
      variants: productVariants(product),
      updatedAt: dateLabel(product.updatedAt),
    }
  })
}

export async function getProductDocument(
  id: string,
): Promise<(Partial<Product> & { id: string }) | null> {
  if (!getFirebaseAdminStatus().available) {
    return null
  }

  const doc = await getFirebaseAdminFirestore().collection("products").doc(id).get()

  return doc.exists ? { ...(doc.data() as Partial<Product>), id: doc.id } : null
}

export async function listCategories(): Promise<AdminCategoryRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("categories").limit(100).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      name?: string
      slug?: string
      description?: string
      status?: AdminCategoryRow["status"]
      position?: number
    }>(doc)

    return {
      id: item.id,
      name: item.name ?? "Catégorie",
      slug: item.slug ?? item.id,
      description: item.description,
      status: item.status ?? "draft",
      position: item.position ?? 0,
    }
  })
}

export async function listCollections(): Promise<AdminCollectionRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("collections").limit(100).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      name?: string
      slug?: string
      description?: string
      status?: AdminCollectionRow["status"]
      position?: number
      type?: AdminCollectionRow["type"]
      startsAt?: unknown
      endsAt?: unknown
    }>(doc)

    return {
      id: item.id,
      name: item.name ?? "Collection",
      slug: item.slug ?? item.id,
      description: item.description,
      status: item.status ?? "draft",
      position: item.position ?? 0,
      type: item.type ?? "permanent",
      startsAt: item.startsAt ? dateLabel(item.startsAt) : undefined,
      endsAt: item.endsAt ? dateLabel(item.endsAt) : undefined,
    }
  })
}

export async function listMedia(): Promise<AdminMediaRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("media").limit(200).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      url?: string
      alt?: string
      status?: AdminMediaRow["status"]
      usage?: string
    }>(doc)

    return {
      id: item.id,
      url: item.url ?? "",
      alt: item.alt ?? "Image",
      status: item.status ?? "draft",
      usage: item.usage,
    }
  })
}

export async function listOrderRequests(): Promise<AdminRequestRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("orderRequests").limit(200).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      customer?: { name?: string; phone?: string; city?: string }
      subtotal?: number
      status?: string
      createdAt?: unknown
    }>(doc)

    return {
      id: item.id,
      createdAt: dateLabel(item.createdAt),
      customerName: item.customer?.name ?? "Cliente",
      phone: item.customer?.phone ?? "",
      city: item.customer?.city,
      subtotal: item.subtotal ?? 0,
      status: item.status ?? "whatsappInitiated",
    }
  })
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("adminUsers").limit(100).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      uid?: string
      email?: string
      displayName?: string
      role?: AdminRole
      status?: "active" | "disabled"
      lastLoginAt?: unknown
    }>(doc)

    return {
      uid: item.uid ?? item.id,
      email: item.email ?? "",
      displayName: item.displayName ?? "Administrateur",
      role: item.role ?? "editor",
      status: item.status ?? "active",
      lastLoginAt: item.lastLoginAt ? dateLabel(item.lastLoginAt) : undefined,
    }
  })
}

export async function getSiteSettingsDocument() {
  if (!getFirebaseAdminStatus().available) {
    return null
  }

  const doc = await getFirebaseAdminFirestore().collection("siteSettings").doc("default").get()

  return doc.exists ? { id: doc.id, ...doc.data() } : null
}

export async function listHomepageSections(): Promise<AdminHomepageSectionRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("homepageSections").limit(100).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      kind?: string
      title?: string
      status?: AdminHomepageSectionRow["status"]
      position?: number
    }>(doc)

    return {
      id: item.id,
      kind: item.kind ?? "section",
      title: item.title ?? "Section",
      status: item.status ?? "draft",
      position: item.position ?? 0,
    }
  })
}

export async function getMainHeroSection(): Promise<AdminMainHeroSection | null> {
  if (!getFirebaseAdminStatus().available) {
    return null
  }

  const doc = await getFirebaseAdminFirestore()
    .collection("homepageSections")
    .doc("main-hero")
    .get()

  if (!doc.exists) {
    return null
  }

  const item = doc.data() as {
    title?: string
    eyebrow?: string
    body?: string
    ctaLabel?: string
    productIds?: unknown
    heroDesktopMedia?: ProductImage
    heroMobileMedia?: ProductImage
    heroVideoUrl?: string
  }

  return {
    id: doc.id,
    title: item.title,
    eyebrow: item.eyebrow,
    body: item.body,
    ctaLabel: item.ctaLabel,
    productIds: Array.isArray(item.productIds)
      ? item.productIds.filter((id): id is string => typeof id === "string")
      : [],
    heroDesktopMedia: item.heroDesktopMedia,
    heroMobileMedia: item.heroMobileMedia,
    heroVideoUrl: item.heroVideoUrl,
  }
}

export async function listFaqs(): Promise<AdminFaqRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("faqs").limit(100).get()

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      question?: string
      status?: AdminFaqRow["status"]
      position?: number
    }>(doc)

    return {
      id: item.id,
      question: item.question ?? "Question",
      status: item.status ?? "draft",
      position: item.position ?? 0,
    }
  })
}

export async function listTestimonials(): Promise<AdminTestimonialRow[]> {
  if (!getFirebaseAdminStatus().available) {
    return []
  }

  const snapshot = await getFirebaseAdminFirestore().collection("testimonials").limit(100).get()

  return snapshot.docs
    .map((doc) => {
      const item = toPlain<{
        authorName?: string
        customerName?: string
        city?: string
        rating?: number
        content?: string
        verifiedPurchase?: boolean
        isPublished?: boolean
        status?: "draft" | "published" | "archived"
        createdAt?: unknown
        orderIndex?: number
        position?: number
      }>(doc)

      return {
        id: item.id,
        authorName: item.authorName ?? item.customerName ?? "Cliente",
        city: item.city,
        rating: item.rating ?? 5,
        content: item.content ?? "",
        verifiedPurchase: item.verifiedPurchase ?? false,
        isPublished: item.isPublished ?? item.status === "published",
        createdAt: dateLabel(item.createdAt),
        orderIndex: item.orderIndex ?? item.position ?? 0,
      }
    })
    .sort((left, right) => {
      if (left.orderIndex !== right.orderIndex) {
        return left.orderIndex - right.orderIndex
      }

      return right.createdAt.localeCompare(left.createdAt)
    })
}

export async function getDashboardData(): Promise<DashboardData> {
  const [products, categories, collections, requests, analytics] = await Promise.all([
    listProducts(),
    listCategories(),
    listCollections(),
    listOrderRequests(),
    getAnalyticsSummary(),
  ])

  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 2).length

  return {
    products: products.length,
    publishedProducts: products.filter((product) => product.status === "published").length,
    drafts: products.filter((product) => product.status === "draft").length,
    outOfStock: products.filter((product) => product.stock === 0).length,
    lowStock,
    categories: categories.length,
    collections: collections.length,
    totalVisits: analytics.totalVisits,
    productViews: analytics.productViews,
    cartAdds: analytics.cartAdds,
    favoriteAdds: analytics.favoriteAdds,
    whatsappClicks: analytics.whatsappClicks,
    whatsappRequests: requests.length,
    trafficSources: analytics.trafficSources,
    topPages: analytics.topPages,
    recentlyModified: products
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        label: product.name,
        collection: "products",
        updatedAt: product.updatedAt,
      })),
  }
}

export { productLowStock }
