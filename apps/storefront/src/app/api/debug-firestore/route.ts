import { NextResponse } from "next/server"

import { parseServerEnv } from "@bibajilbab/config"

import { getFirebaseAdminFirestore, getFirebaseAdminStatus } from "@/lib/firebase/admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function serializeFirestoreValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreValue)
  }

  const record = value as Record<string, unknown>

  if (typeof record.toDate === "function") {
    const date = record.toDate()

    return date instanceof Date ? date.toISOString() : String(date)
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, serializeFirestoreValue(entry)]),
  )
}

export async function GET() {
  const env = parseServerEnv(process.env)
  const firebase = getFirebaseAdminStatus()

  try {
    const snapshot = await getFirebaseAdminFirestore().collection("products").get()
    const firstDocument = snapshot.docs[0]

    return NextResponse.json(
      {
        status: "success",
        projectId: env.firebaseAdmin.projectId ?? null,
        firebase,
        count: snapshot.size,
        firstDocument: firstDocument
          ? {
              id: firstDocument.id,
              data: serializeFirestoreValue(firstDocument.data()),
            }
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    console.error("[Storefront Firestore Error]", error)

    return NextResponse.json(
      {
        status: "error",
        projectId: env.firebaseAdmin.projectId ?? null,
        firebase,
        count: 0,
        firstDocument: null,
        error: {
          message: normalizedError.message,
          stack: normalizedError.stack ?? null,
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
