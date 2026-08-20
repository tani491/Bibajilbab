"use server"

import { revalidatePath } from "next/cache"
import { FieldValue } from "firebase-admin/firestore"

import { FirebaseUnavailableError } from "@bibajilbab/config"

import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin"

import {
  adminUserInviteSchema,
  adminUserRoleUpdateSchema,
  adminUserStatusUpdateSchema,
  categoryFormSchema,
  collectionFormSchema,
  faqFormSchema,
  homepageSectionFormSchema,
  inventoryAdjustmentSchema,
  mediaFormSchema,
  orderRequestUpdateSchema,
  productHeroFromFormData,
  productFromFormData,
  siteSettingsFormSchema,
  testimonialFormSchema,
} from "./admin-schemas"
import { getProductDocument } from "./admin-data"
import { requireAdminSession } from "./auth"
import { writeAuditLog } from "./audit"
import { assertSameOriginRequest } from "./csrf"
import { parseSimpleCsv } from "./csv"
import { applyStockAdjustment } from "./inventory"

export interface ActionState {
  ok: boolean
  message: string
  resetLink?: string
}

const ok = (message: string, extra?: Partial<ActionState>): ActionState => ({
  ok: true,
  message,
  ...extra,
})

const fail = (message: string): ActionState => ({
  ok: false,
  message,
})

function docIdFromForm(formData: FormData, fallback: string): string {
  const id = formData.get("id")

  return typeof id === "string" && id.trim() ? id.trim() : fallback
}

function withoutUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(withoutUndefined) as T
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, entry]) =>
        entry === undefined ? [] : [[key, withoutUndefined(entry)]],
      ),
    ) as T
  }

  return value
}

function parseOptionalJson(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return JSON.parse(value)
}

function parseCsvImageUrl(value: unknown): string {
  const url = String(value ?? "").trim()

  try {
    return new URL(url).toString()
  } catch {
    throw new Error("CSV invalide : imageUrl doit être une URL absolue valide.")
  }
}

async function ensureConfiguredDb() {
  try {
    return getFirebaseAdminFirestore()
  } catch (error) {
    if (error instanceof FirebaseUnavailableError) {
      throw new Error("Firebase Admin doit être configuré pour cette mutation.")
    }

    throw error
  }
}

async function requireActionSession(allowedRoles: Parameters<typeof requireAdminSession>[0]) {
  await assertSameOriginRequest()

  return requireAdminSession(allowedRoles)
}

export async function saveProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const db = await ensureConfiguredDb()
    const product = productFromFormData(formData)
    const hero = productHeroFromFormData(formData)
    const documentId = docIdFromForm(formData, product.slug)
    const existing = await getProductDocument(documentId)
    const existingCreatedAt =
      existing && typeof existing.createdAt === "string" ? existing.createdAt : product.createdAt
    const now = new Date().toISOString()

    await db
      .collection("products")
      .doc(documentId)
      .set(
        withoutUndefined({
          ...product,
          id: documentId,
          createdAt: existingCreatedAt,
          updatedAt: now,
        }),
        { merge: true },
      )

    if (hero.enabled) {
      const heroDoc = await db.collection("homepageSections").doc("main-hero").get()
      const heroData = heroDoc.exists ? heroDoc.data() : null
      const heroCreatedAt =
        heroData && typeof heroData.createdAt === "string" ? heroData.createdAt : now
      const heroMedia = hero.media
      const heroPayload = {
        id: "main-hero",
        kind: "hero",
        title: product.name,
        eyebrow: "BibaJilbab Sénégal",
        body: product.shortDescription,
        ctaLabel: "Voir le produit",
        ctaHref: `/produits/${product.slug}`,
        productIds: [documentId],
        mediaId: heroMedia?.id ?? documentId,
        position: 0,
        status: product.status === "archived" ? "draft" : "published",
        createdAt: heroCreatedAt,
        updatedAt: now,
        ...(heroMedia?.kind === "video"
          ? {
              heroVideoUrl: heroMedia.url,
              heroDesktopMedia: FieldValue.delete(),
              heroMobileMedia: FieldValue.delete(),
            }
          : {}),
        ...(heroMedia?.kind !== "video" && heroMedia
          ? {
              heroDesktopMedia: heroMedia,
              heroMobileMedia: heroMedia,
              heroVideoUrl: FieldValue.delete(),
            }
          : {}),
      }

      await db.collection("homepageSections").doc("main-hero").set(heroPayload, { merge: true })
    } else if (hero.wasEnabled) {
      const heroDoc = await db.collection("homepageSections").doc("main-hero").get()
      const heroProductIds = heroDoc.exists ? heroDoc.data()?.productIds : null

      if (Array.isArray(heroProductIds) && heroProductIds.includes(documentId)) {
        await db.collection("homepageSections").doc("main-hero").set(
          {
            productIds: [],
            status: "draft",
            updatedAt: now,
          },
          { merge: true },
        )
      }
    }

    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: existing ? "products.update" : "products.create",
      collection: "products",
      documentId,
    })
    revalidatePath("/products")
    revalidatePath("/content")
    revalidatePath("/")
    revalidatePath("/produits")
    revalidatePath("/catalogue")
    revalidatePath("/produits/[slug]", "page")
    revalidatePath("/categories/[slug]", "page")
    revalidatePath("/collections/[slug]", "page")

    return ok(existing ? "Produit modifié." : "Produit créé.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Produit non enregistré.")
  }
}

export async function updateProductStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")

  if (!id || !["draft", "published", "archived"].includes(status)) {
    return fail("Statut produit invalide.")
  }

  try {
    const db = await ensureConfiguredDb()
    await db
      .collection("products")
      .doc(id)
      .set({ status, updatedAt: new Date().toISOString() }, { merge: true })
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: `products.status.${status}`,
      collection: "products",
      documentId: id,
    })
    revalidatePath("/products")
    revalidatePath("/")
    revalidatePath("/produits")
    revalidatePath("/catalogue")
    revalidatePath("/produits/[slug]", "page")
    revalidatePath("/categories/[slug]", "page")
    revalidatePath("/collections/[slug]", "page")

    return ok("Statut mis à jour.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Statut non modifié.")
  }
}

export async function duplicateProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])
  const id = String(formData.get("id") ?? "")

  if (!id) {
    return fail("Produit source manquant.")
  }

  try {
    const db = await ensureConfiguredDb()
    const source = await db.collection("products").doc(id).get()

    if (!source.exists) {
      return fail("Produit source introuvable.")
    }

    const data = source.data() ?? {}
    const nextId = `${id}-copie-${Date.now()}`
    await db
      .collection("products")
      .doc(nextId)
      .set({
        ...data,
        id: nextId,
        name: `${String(data.name ?? "Produit")} copie`,
        slug: nextId,
        sku: `${String(data.sku ?? "SKU")}-COPY`,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "products.duplicate",
      collection: "products",
      documentId: nextId,
      metadata: { sourceId: id },
    })
    revalidatePath("/products")

    return ok("Produit dupliqué en brouillon.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Duplication impossible.")
  }
}

export async function deleteProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin"])
  const id = String(formData.get("id") ?? "")

  if (!id) {
    return fail("Produit introuvable.")
  }

  try {
    const db = await ensureConfiguredDb()
    await db.collection("products").doc(id).delete()
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "products.delete",
      collection: "products",
      documentId: id,
    })
    revalidatePath("/products")
    revalidatePath("/")
    revalidatePath("/produits")
    revalidatePath("/produits/[slug]", "page")

    return ok("Produit supprimé.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Suppression impossible.")
  }
}

export async function importProductsCsvAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])
  const csv = String(formData.get("csv") ?? "")

  try {
    const rows = parseSimpleCsv(csv, 100)
    const db = await ensureConfiguredDb()
    const batch = db.batch()

    for (const row of rows) {
      const slug = String(row.slug ?? "")
      const name = String(row.name ?? "")
      const sku = String(row.sku ?? "")
      const price = Number.parseInt(String(row.price ?? "0"), 10)

      const imageUrl = parseCsvImageUrl(row.imageUrl)
      const imageAlt = String(row.imageAlt ?? name).trim()

      if (!slug || !name || !sku || !Number.isInteger(price) || !imageAlt) {
        throw new Error(
          "CSV invalide : colonnes requises name, slug, sku, price, imageUrl, imageAlt.",
        )
      }

      const ref = db.collection("products").doc(slug)
      batch.set(
        ref,
        {
          id: slug,
          name,
          slug,
          sku,
          shortDescription: String(row.shortDescription ?? name),
          longDescription: String(row.longDescription ?? name),
          price,
          currency: "XOF",
          categoryId: String(row.categoryId ?? "non-classe"),
          collectionIds: [],
          tags: [],
          images: [
            {
              url: imageUrl,
              alt: imageAlt,
              position: 0,
            },
          ],
          sizes: [],
          colors: [],
          variants: [],
          featured: false,
          status: "draft",
          seo: {
            metaTitle: name,
            metaDescription: String(row.shortDescription ?? name).slice(0, 160),
            noIndex: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    }

    await batch.commit()
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "products.importCsv",
      collection: "products",
      metadata: { rows: rows.length },
    })
    revalidatePath("/products")

    return ok(`${rows.length} produit(s) importé(s) en brouillon.`)
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Import impossible.")
  }
}

export async function saveCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const parsed = categoryFormSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const documentId = parsed.id || parsed.slug
    await db
      .collection("categories")
      .doc(documentId)
      .set(
        {
          ...parsed,
          id: documentId,
          image: parseOptionalJson(parsed.imageJson),
          seo:
            parsed.seoTitle || parsed.seoDescription
              ? {
                  metaTitle: parsed.seoTitle || parsed.name,
                  metaDescription: parsed.seoDescription || parsed.description || parsed.name,
                  noIndex: parsed.status !== "published",
                }
              : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "categories.save",
      collection: "categories",
      documentId,
    })
    revalidatePath("/categories")

    return ok("Catégorie enregistrée.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Catégorie non enregistrée.")
  }
}

export async function saveCollectionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const parsed = collectionFormSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const documentId = parsed.id || parsed.slug
    await db
      .collection("collections")
      .doc(documentId)
      .set(
        {
          ...parsed,
          id: documentId,
          image: parseOptionalJson(parsed.imageJson),
          seo:
            parsed.seoTitle || parsed.seoDescription
              ? {
                  metaTitle: parsed.seoTitle || parsed.name,
                  metaDescription: parsed.seoDescription || parsed.description || parsed.name,
                  noIndex: parsed.status !== "published",
                }
              : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "collections.save",
      collection: "collections",
      documentId,
    })
    revalidatePath("/categories")

    return ok("Collection enregistrée.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Collection non enregistrée.")
  }
}

export async function saveMediaAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const parsed = mediaFormSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const documentId =
      parsed.id ||
      parsed.cloudinaryPublicId?.replace(/[^\w-]/g, "-") ||
      new URL(parsed.url).pathname.replace(/[^\w-]/g, "-").replace(/^-+|-+$/g, "") ||
      crypto.randomUUID()
    await db
      .collection("media")
      .doc(documentId)
      .set(
        {
          ...parsed,
          id: documentId,
          cloudinaryPublicId: parsed.cloudinaryPublicId ?? documentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "media.save",
      collection: "media",
      documentId,
    })
    revalidatePath("/media")
    revalidatePath("/")
    revalidatePath("/produits")

    return ok("Média enregistré.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Média non enregistré.")
  }
}

export async function saveContentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const kind = String(formData.get("contentKind") ?? formData.get("kind") ?? "")
    const db = await ensureConfiguredDb()

    if (kind === "settings") {
      if (session.role !== "admin") {
        return fail("Seul un administrateur peut modifier les paramètres critiques.")
      }

      const parsed = siteSettingsFormSchema.parse(Object.fromEntries(formData))
      await db
        .collection("siteSettings")
        .doc("default")
        .set(
          {
            ...parsed,
            id: "default",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } else if (kind === "faq") {
      const parsed = faqFormSchema.parse(Object.fromEntries(formData))
      await db
        .collection("faqs")
        .doc(parsed.id || crypto.randomUUID())
        .set(
          {
            ...parsed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } else if (kind === "testimonial") {
      const parsed = testimonialFormSchema.parse(Object.fromEntries(formData))
      await db
        .collection("testimonials")
        .doc(parsed.id || crypto.randomUUID())
        .set(
          {
            ...parsed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } else if (kind === "section") {
      const parsed = homepageSectionFormSchema.parse(Object.fromEntries(formData))
      await db
        .collection("homepageSections")
        .doc(parsed.id || crypto.randomUUID())
        .set(
          {
            ...parsed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
    } else {
      return fail("Type de contenu inconnu.")
    }

    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: `content.${kind}.save`,
      collection: kind,
    })
    revalidatePath("/content")
    revalidatePath("/settings")
    revalidatePath("/")
    revalidatePath("/produits")

    return ok("Contenu enregistré.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Contenu non enregistré.")
  }
}

export async function updateOrderRequestAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const parsed = orderRequestUpdateSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const requestRef = db.collection("orderRequests").doc(parsed.requestId)
    const requestSnapshot = await requestRef.get()
    const requestData = requestSnapshot.data()
    const previousStatus = String(requestData?.status ?? "")

    await db.runTransaction(async (transaction) => {
      transaction.set(
        requestRef,
        {
          status: parsed.status,
          internalNote: parsed.internalNote ?? "",
          history: FieldValue.arrayUnion({
            status: parsed.status,
            note: parsed.internalNote ?? "",
            actorUid: session.uid,
            createdAt: new Date().toISOString(),
          }),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      if (parsed.status !== "confirmed" || previousStatus === "confirmed") {
        return
      }

      const items = Array.isArray(requestData?.items) ? requestData.items : []

      for (const item of items) {
        if (!item || typeof item !== "object") {
          continue
        }

        const line = item as { productId?: string; variantId?: string; quantity?: number }

        if (!line.productId || !line.variantId || typeof line.quantity !== "number") {
          continue
        }

        const quantity = line.quantity
        const productRef = db.collection("products").doc(line.productId)
        const productSnapshot = await transaction.get(productRef)
        const product = productSnapshot.data()
        const variants = Array.isArray(product?.variants) ? product.variants : []
        const nextVariants = variants.map((variant) => {
          if (!variant || typeof variant !== "object") {
            return variant
          }

          const current = variant as {
            id?: string
            stock?: number
            lowStockThreshold?: number
            status?: "active" | "inactive"
          }

          if (!current.id || current.id !== line.variantId) {
            return variant
          }

          return applyStockAdjustment({
            variant: {
              id: current.id,
              stock: current.stock ?? 0,
              lowStockThreshold: current.lowStockThreshold ?? 0,
              status: current.status ?? "active",
            },
            delta: -quantity,
          })
        })

        transaction.set(
          productRef,
          { variants: nextVariants, updatedAt: new Date().toISOString() },
          { merge: true },
        )
        transaction.create(db.collection("inventoryMovements").doc(), {
          productId: line.productId,
          variantId: line.variantId,
          type: "stockOut",
          quantity: -quantity,
          reason: `Demande ${parsed.requestId} confirmée manuellement`,
          createdByAdminId: session.uid,
          createdAt: new Date().toISOString(),
        })
      }
    })

    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "orderRequests.updateStatus",
      collection: "orderRequests",
      documentId: parsed.requestId,
      metadata: { status: parsed.status },
    })
    revalidatePath("/requests")
    revalidatePath("/inventory")

    return ok("Demande mise à jour.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Demande non mise à jour.")
  }
}

export async function adjustInventoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin", "editor"])

  try {
    const parsed = inventoryAdjustmentSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const productRef = db.collection("products").doc(parsed.productId)

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(productRef)
      const data = snapshot.data()
      const variants = Array.isArray(data?.variants) ? data.variants : []
      const nextVariants = variants.map((variant) => {
        if (!variant || typeof variant !== "object") {
          return variant
        }

        const current = variant as {
          id?: string
          stock?: number
          lowStockThreshold?: number
          status?: "active" | "inactive"
        }

        if (current.id !== parsed.variantId) {
          return variant
        }

        return applyStockAdjustment({
          variant: {
            id: current.id,
            stock: current.stock ?? 0,
            lowStockThreshold: current.lowStockThreshold ?? 0,
            status: current.status ?? "active",
          },
          delta: parsed.delta,
        })
      })

      transaction.set(
        productRef,
        { variants: nextVariants, updatedAt: new Date().toISOString() },
        { merge: true },
      )
      transaction.create(db.collection("inventoryMovements").doc(), {
        productId: parsed.productId,
        variantId: parsed.variantId,
        type: "adjustment",
        quantity: parsed.delta,
        reason: parsed.reason,
        createdByAdminId: session.uid,
        createdAt: new Date().toISOString(),
      })
    })

    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "inventory.adjust",
      collection: "inventoryMovements",
      documentId: parsed.variantId,
    })
    revalidatePath("/inventory")
    revalidatePath("/products")

    return ok("Stock ajusté.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Stock non ajusté.")
  }
}

async function countActiveAdmins(excludingUid?: string): Promise<number> {
  const snapshot = await getFirebaseAdminFirestore()
    .collection("adminUsers")
    .where("role", "==", "admin")
    .where("status", "==", "active")
    .get()

  return snapshot.docs.filter((doc) => doc.id !== excludingUid).length
}

export async function inviteAdminUserAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin"])

  try {
    const parsed = adminUserInviteSchema.parse(Object.fromEntries(formData))
    const auth = getFirebaseAdminAuth()
    const db = await ensureConfiguredDb()
    const user = await auth.createUser({
      email: parsed.email,
      displayName: parsed.displayName,
      emailVerified: false,
      disabled: false,
    })
    await auth.setCustomUserClaims(user.uid, {
      adminRole: parsed.role,
      admin: parsed.role === "admin",
    })
    await db.collection("adminUsers").doc(user.uid).set({
      uid: user.uid,
      email: parsed.email,
      displayName: parsed.displayName,
      role: parsed.role,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const resetLink = await auth.generatePasswordResetLink(parsed.email)
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "adminUsers.invite",
      collection: "adminUsers",
      documentId: user.uid,
      metadata: { role: parsed.role },
    })
    revalidatePath("/users")

    return ok("Utilisateur créé. Transmettez le lien de réinitialisation par un canal sûr.", {
      resetLink,
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Invitation impossible.")
  }
}

export async function updateAdminUserRoleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin"])

  try {
    const parsed = adminUserRoleUpdateSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const snapshot = await db.collection("adminUsers").doc(parsed.uid).get()
    const currentRole = snapshot.data()?.role

    if (
      currentRole === "admin" &&
      parsed.role !== "admin" &&
      (await countActiveAdmins(parsed.uid)) === 0
    ) {
      return fail("Impossible de retirer le dernier administrateur actif.")
    }

    await getFirebaseAdminAuth().setCustomUserClaims(parsed.uid, {
      adminRole: parsed.role,
      admin: parsed.role === "admin",
    })
    await db.collection("adminUsers").doc(parsed.uid).set(
      {
        role: parsed.role,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "adminUsers.role.update",
      collection: "adminUsers",
      documentId: parsed.uid,
      metadata: { role: parsed.role },
    })
    revalidatePath("/users")

    return ok("Rôle mis à jour.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Rôle non modifié.")
  }
}

export async function updateAdminUserStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireActionSession(["admin"])

  try {
    const parsed = adminUserStatusUpdateSchema.parse(Object.fromEntries(formData))
    const db = await ensureConfiguredDb()
    const snapshot = await db.collection("adminUsers").doc(parsed.uid).get()
    const currentRole = snapshot.data()?.role

    if (
      currentRole === "admin" &&
      parsed.status === "disabled" &&
      (await countActiveAdmins(parsed.uid)) === 0
    ) {
      return fail("Impossible de désactiver le dernier administrateur actif.")
    }

    await getFirebaseAdminAuth().updateUser(parsed.uid, { disabled: parsed.status === "disabled" })
    await db.collection("adminUsers").doc(parsed.uid).set(
      {
        status: parsed.status,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "adminUsers.status.update",
      collection: "adminUsers",
      documentId: parsed.uid,
      metadata: { status: parsed.status },
    })
    revalidatePath("/users")

    return ok("Statut utilisateur mis à jour.")
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Statut non modifié.")
  }
}
