import { NextResponse } from "next/server"

import { clearSessionCookie, getAdminSession } from "@/lib/auth"
import { writeAuditLog } from "@/lib/audit"
import { isSameOriginRequest } from "@/lib/csrf"

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Origine de requête refusée." }, { status: 403 })
  }

  const session = await getAdminSession()

  if (session) {
    await writeAuditLog({
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
      action: "admin.session.logout",
      collection: "adminUsers",
      documentId: session.uid,
    })
  }

  await clearSessionCookie()

  return NextResponse.json({ ok: true })
}
