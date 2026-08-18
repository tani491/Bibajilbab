import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { DecodedIdToken } from "firebase-admin/auth"

import { FirebaseUnavailableError, parseServerEnv } from "@bibajilbab/config"

import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin"

import { getMockAdminSessionFromCookie } from "./mock-auth"
import { isAdminRole, type AdminRole } from "./permissions"
import { sessionCookieName } from "./session"

const sessionDurationMs = 5 * 24 * 60 * 60 * 1000

export interface AdminSession {
  uid: string
  email: string
  displayName: string
  role: AdminRole
  isMock?: boolean
}

interface AdminUserDoc {
  email?: unknown
  displayName?: unknown
  role?: unknown
  status?: unknown
}

function roleFromClaims(decodedToken: DecodedIdToken): AdminRole | null {
  const adminRole = decodedToken.adminRole
  const legacyRole = decodedToken.role

  if (isAdminRole(adminRole)) {
    return adminRole
  }

  if (isAdminRole(legacyRole)) {
    return legacyRole
  }

  if (decodedToken.admin === true) {
    return "admin"
  }

  return null
}

async function getAdminUserDoc(uid: string): Promise<AdminUserDoc | null> {
  const db = getFirebaseAdminFirestore()
  const snapshot = await db.collection("adminUsers").doc(uid).get()

  return snapshot.exists ? (snapshot.data() as AdminUserDoc) : null
}

export function getSessionCookieOptions() {
  const env = parseServerEnv(process.env)

  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(sessionDurationMs / 1000),
  }
}

export async function createVerifiedSessionCookie(idToken: string): Promise<{
  cookie: string
  session: AdminSession
}> {
  const auth = getFirebaseAdminAuth()
  const decoded = await auth.verifyIdToken(idToken, true)
  const doc = await getAdminUserDoc(decoded.uid)
  const claimRole = roleFromClaims(decoded)
  const docRole = isAdminRole(doc?.role) ? doc.role : null
  const role = docRole ?? claimRole
  const status = typeof doc?.status === "string" ? doc.status : "active"

  if (!role || status !== "active") {
    throw new Error("Compte administrateur non autorisé ou désactivé.")
  }

  const cookie = await auth.createSessionCookie(idToken, {
    expiresIn: sessionDurationMs,
  })

  return {
    cookie,
    session: {
      uid: decoded.uid,
      email:
        (typeof doc?.email === "string" ? doc.email : undefined) ??
        decoded.email ??
        "admin@bibajilbab.local",
      displayName:
        (typeof doc?.displayName === "string" ? doc.displayName : undefined) ??
        decoded.name ??
        decoded.email ??
        "Administrateur",
      role,
    },
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(sessionCookieName)?.value

  if (!sessionCookie) {
    return null
  }

  const mockSession = getMockAdminSessionFromCookie(sessionCookie)

  if (mockSession) {
    return mockSession
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true)
    const doc = await getAdminUserDoc(decoded.uid)
    const claimRole = roleFromClaims(decoded)
    const docRole = isAdminRole(doc?.role) ? doc.role : null
    const role = docRole ?? claimRole
    const status = typeof doc?.status === "string" ? doc.status : "active"

    if (!role || status !== "active") {
      return null
    }

    return {
      uid: decoded.uid,
      email:
        (typeof doc?.email === "string" ? doc.email : undefined) ??
        decoded.email ??
        "admin@bibajilbab.local",
      displayName:
        (typeof doc?.displayName === "string" ? doc.displayName : undefined) ??
        decoded.name ??
        decoded.email ??
        "Administrateur",
      role,
    }
  } catch (error) {
    if (error instanceof FirebaseUnavailableError) {
      return null
    }

    return null
  }
}

export async function requireAdminSession(allowedRoles: AdminRole[] = ["admin", "editor"]) {
  const session = await getAdminSession()

  if (!session) {
    redirect("/login")
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized")
  }

  return session
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(sessionCookieName, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
}

export async function setSessionCookie(value: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(sessionCookieName, value, getSessionCookieOptions())
}
