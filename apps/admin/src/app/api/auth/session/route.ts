export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { z } from "zod"

import { FirebaseUnavailableError } from "@bibajilbab/config"

import { createVerifiedSessionCookie, setSessionCookie } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { isSameOriginRequest } from "@/lib/csrf"
import { checkRateLimit } from "@/lib/rate-limit"

const bodySchema = z.object({
  idToken: z.string().trim().min(20),
  email: z.string().email().optional(),
})

function requestKey(request: Request, email?: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown"

  return `admin-login:${ip}:${email ?? "unknown"}`
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(message))
    }, timeoutMs)

    promise.then(
      (value) => {
        clearTimeout(timeout)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null))

  if (!body.success) {
    return NextResponse.json({ error: "Requête de session invalide." }, { status: 400 })
  }

  const rateLimit = checkRateLimit({
    key: requestKey(request, body.data.email),
    limit: 8,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Trop de tentatives. Réessayez dans quelques minutes.",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      { status: 429 },
    )
  }

  try {
    const { cookie, session } = await withTimeout(
      createVerifiedSessionCookie(body.data.idToken),
      12_000,
      "Firebase Admin ne répond pas. Vérifiez les variables serveur.",
    )
    await setSessionCookie(cookie)
    let auditLogged = true

    try {
      await withTimeout(
        writeAuditLog({
          actorUid: session.uid,
          actorEmail: session.email,
          actorRole: session.role,
          action: "admin.session.create",
          collection: "adminUsers",
          documentId: session.uid,
        }),
        5_000,
        "Connexion validée, mais l'audit serveur n'a pas répondu.",
      )
    } catch {
      auditLogged = false
    }

    return NextResponse.json({ auditLogged, ok: true, role: session.role })
  } catch (error) {
    if (error instanceof FirebaseUnavailableError) {
      return NextResponse.json(
        { error: "Firebase Admin n'est pas configuré pour créer une session sécurisée." },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connexion refusée." },
      { status: 403 },
    )
  }
}
