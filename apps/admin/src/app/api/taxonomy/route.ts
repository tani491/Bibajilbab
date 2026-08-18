import { NextResponse } from "next/server"
import { z } from "zod"

import { FirebaseUnavailableError } from "@bibajilbab/config"

import { getAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { isSameOriginRequest } from "@/lib/csrf"
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin"

const taxonomyBodySchema = z.object({
  kind: z.enum(["category", "collection"]),
  name: z.string().trim().min(1).max(90),
  slug: z.string().trim().max(140).optional(),
  collectionType: z.enum(["permanent", "tabaski", "korite", "seasonal"]).optional(),
})

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

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ error: "Connexion administrateur requise." }, { status: 401 })
  }

  if (!["admin", "editor"].includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  }

  const body = taxonomyBodySchema.safeParse(await request.json().catch(() => null))

  if (!body.success) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400 })
  }

  const slug = slugify(body.data.slug || body.data.name)
  const now = new Date().toISOString()
  const option = {
    id: slug,
    name: body.data.name,
    slug,
    type: body.data.kind === "collection" ? (body.data.collectionType ?? "permanent") : null,
  }

  if (session.isMock) {
    return NextResponse.json({ option })
  }

  try {
    const db = getFirebaseAdminFirestore()
    const collectionName = body.data.kind === "category" ? "categories" : "collections"
    const payload =
      body.data.kind === "category"
        ? {
            id: slug,
            name: body.data.name,
            slug,
            description: "",
            position: 0,
            status: "published",
            createdAt: now,
            updatedAt: now,
          }
        : {
            id: slug,
            name: body.data.name,
            slug,
            description: "",
            type: body.data.collectionType ?? "permanent",
            position: 0,
            status: "published",
            createdAt: now,
            updatedAt: now,
          }

    await db.collection(collectionName).doc(slug).set(payload, { merge: true })
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: `${collectionName}.quick-create`,
      collection: collectionName,
      documentId: slug,
    })

    return NextResponse.json({
      option,
    })
  } catch (error) {
    if (error instanceof FirebaseUnavailableError) {
      return NextResponse.json(
        { error: "Base de données administrateur non configurée." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Création impossible." },
      { status: 500 },
    )
  }
}
