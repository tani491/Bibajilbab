import { NextResponse } from "next/server"

import { parseServerEnv } from "@bibajilbab/config"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "@/lib/firebase/admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isAuthorizedDebugRequest(request: Request): boolean {
  const expectedSecret = process.env.DEBUG_FIRESTORE_SECRET

  return Boolean(
    expectedSecret && request.headers.get("x-bibajilbab-debug-secret") === expectedSecret,
  )
}

export async function GET(request: Request) {
  const env = parseServerEnv(process.env)

  if (!isAuthorizedDebugRequest(request)) {
    return NextResponse.json({ error: "Route indisponible." }, { status: 404 })
  }

  const firebase = getFirebaseAdminStatus()

  try {
    const snapshot = await getFirebaseAdminFirestore().collection("products").get()

    return NextResponse.json(
      {
        status: "ok",
        firebase: { available: firebase.available },
        count: snapshot.size,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    if (!env.isProduction) {
      console.error("[Storefront Firestore Error]", normalizedError.message)
    }

    return NextResponse.json(
      {
        status: "error",
        firebase: { available: firebase.available },
        count: 0,
        error: { message: normalizedError.message },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
