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
  customerName: string
  status: "draft" | "published" | "archived"
  position: number
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
  cartAdds: number
  favoriteAdds: number
  whatsappClicks: number
  whatsappRequests: number
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
      status?: AdminCategoryRow["status"]
      position?: number
    }>(doc)

    return {
      id: item.id,
      name: item.name ?? "Catégorie",
      slug: item.slug ?? item.id,
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

  return snapshot.docs.map((doc) => {
    const item = toPlain<{
      customerName?: string
      status?: AdminTestimonialRow["status"]
      position?: number
    }>(doc)

    return {
      id: item.id,
      customerName: item.customerName ?? "Cliente",
      status: item.status ?? "draft",
      position: item.position ?? 0,
    }
  })
}

export async function getDashboardData(): Promise<DashboardData> {
  const [products, categories, collections, requests] = await Promise.all([
    listProducts(),
    listCategories(),
    listCollections(),
    listOrderRequests(),
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
    productViews: 0,
    cartAdds: 0,
    favoriteAdds: 0,
    whatsappClicks: 0,
    whatsappRequests: requests.length,
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
