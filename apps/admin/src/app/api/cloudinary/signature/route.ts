import { NextResponse } from "next/server"
import { z } from "zod"

import { CloudinaryUnavailableError } from "@bibajilbab/config"

import { createCloudinaryUploadSignature } from "@/lib/cloudinary/server"
import { requireAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { isSameOriginRequest } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limit"

const bodySchema = z.object({
  folder: z.string().trim().max(120).optional(),
})

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const session = await requireAdminSession(["admin", "editor"])
  const rateLimit = checkRateLimit({
    key: `cloudinary-signature:${session.uid}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de signatures demandées. Réessayez plus tard." },
      { status: 429 },
    )
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))

  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres d'upload invalides." }, { status: 400 })
  }

  try {
    const signature = createCloudinaryUploadSignature(parsed.data.folder)
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "cloudinary.signature.create",
      collection: "media",
      metadata: { folder: signature.folder },
    })

    return NextResponse.json(signature)
  } catch (error) {
    if (error instanceof CloudinaryUnavailableError) {
      return NextResponse.json(
        { error: "Cloudinary serveur n'est pas configuré." },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: "Signature impossible." }, { status: 500 })
  }
}
