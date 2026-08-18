import { NextResponse } from "next/server"
import { z } from "zod"

import { setSessionCookie } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { isSameOriginRequest } from "@/lib/csrf"
import {
  createMockAdminSessionCookie,
  getMockAdminConfig,
  verifyMockAdminCredentials,
} from "@/lib/mock-auth"
import { checkRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

function requestKey(request: Request, email?: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown"

  return `admin-mock-login:${ip}:${email ?? "unknown"}`
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const config = getMockAdminConfig()

  if (!config.enabled) {
    return NextResponse.json(
      { error: "Le mode de session admin simulée est désactivé." },
      { status: 404 },
    )
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null))

  if (!body.success) {
    return NextResponse.json({ error: "Identifiants locaux invalides." }, { status: 400 })
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

  const session = verifyMockAdminCredentials(body.data)

  if (!session) {
    return NextResponse.json(
      { error: "Identifiants de démonstration incorrects." },
      { status: 401 },
    )
  }

  await setSessionCookie(createMockAdminSessionCookie(session))

  await writeAuditLog({
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    action: "admin.session.mock.create",
    collection: "adminUsers",
    documentId: session.uid,
    metadata: { simulated: true },
  })

  return NextResponse.json({ mock: true, ok: true, role: session.role })
}
