import { NextResponse } from "next/server"
import { z } from "zod"

import { FirebaseUnavailableError } from "@bibajilbab/config"
import { analyticsEventSchema } from "@bibajilbab/types"

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin"

export const runtime = "nodejs"

const analyticsRequestSchema = z.object({
  name: z.enum(["page_view", "product_view", "cart_add", "favorite_add", "whatsapp_click"]),
  sessionId: z.string().trim().max(160).optional(),
  productId: z.string().trim().max(160).optional(),
  metadata: z.record(z.unknown()).default({}),
})

export async function POST(request: Request) {
  try {
    const parsed = analyticsRequestSchema.parse(await request.json())
    const event = analyticsEventSchema.parse({
      ...parsed,
      source: "storefront",
      metadata: {
        ...parsed.metadata,
        userAgent: request.headers.get("user-agent") ?? "",
      },
      createdAt: new Date().toISOString(),
    })

    await getFirebaseAdminFirestore().collection("analyticsEvents").add(event)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Événement analytique invalide." }, { status: 400 })
    }

    if (error instanceof FirebaseUnavailableError) {
      return NextResponse.json({ ok: true }, { status: 202 })
    }

    return NextResponse.json({ ok: true }, { status: 202 })
  }
}
