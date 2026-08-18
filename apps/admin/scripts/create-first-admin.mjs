/* global console */

import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { FieldValue, getFirestore } from "firebase-admin/firestore"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const envFiles = [
  resolve(scriptDir, "../../../.env.local"),
  resolve(scriptDir, "../../../.env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
]

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function loadLocalEnv() {
  for (const file of envFiles) {
    if (!existsSync(file)) {
      continue
    }

    const lines = readFileSync(file, "utf8").split(/\r?\n/u)

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const separatorIndex = trimmed.indexOf("=")

      if (separatorIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim())

      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

function requiredEnv(primaryKey, fallbackKey) {
  const value = process.env[primaryKey] ?? (fallbackKey ? process.env[fallbackKey] : undefined)

  if (!value || value.trim().length === 0) {
    const fallbackLabel = fallbackKey ? ` ou ${fallbackKey}` : ""
    throw new Error(`Variable ${primaryKey}${fallbackLabel} manquante.`)
  }

  return value
}

loadLocalEnv()

const projectId = requiredEnv("FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_PROJECT_ID")
const clientEmail = requiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_CLIENT_EMAIL")
const privateKey = requiredEnv("FIREBASE_ADMIN_PRIVATE_KEY", "FIREBASE_PRIVATE_KEY").replace(
  /\\n/g,
  "\n",
)
const firstAdminEmail = requiredEnv("FIRST_ADMIN_EMAIL").trim().toLowerCase()
const firstAdminDisplayName =
  process.env.FIRST_ADMIN_DISPLAY_NAME?.trim() || "Administrateur BibaJilbab"

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

const auth = getAuth()
const db = getFirestore()

async function getOrCreateUser() {
  try {
    return await auth.getUserByEmail(firstAdminEmail)
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "auth/user-not-found"
    ) {
      return auth.createUser({
        email: firstAdminEmail,
        displayName: firstAdminDisplayName,
        emailVerified: false,
        disabled: false,
      })
    }

    throw error
  }
}

const user = await getOrCreateUser()

await auth.updateUser(user.uid, {
  displayName: user.displayName || firstAdminDisplayName,
  disabled: false,
})
await auth.setCustomUserClaims(user.uid, {
  adminRole: "admin",
  admin: true,
})
await db
  .collection("adminUsers")
  .doc(user.uid)
  .set(
    {
      uid: user.uid,
      email: firstAdminEmail,
      displayName: user.displayName || firstAdminDisplayName,
      role: "admin",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

const resetLink = await auth.generatePasswordResetLink(firstAdminEmail)

console.log("Premier administrateur prêt.")
console.log(`UID: ${user.uid}`)
console.log(`Email: ${firstAdminEmail}`)
console.log("Lien de réinitialisation temporaire:")
console.log(resetLink)
