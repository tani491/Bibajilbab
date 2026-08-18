import "server-only"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import type { App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import type { Auth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import type { Firestore } from "firebase-admin/firestore"

import { ConfigurationError, FirebaseUnavailableError, parseServerEnv } from "@bibajilbab/config"

export interface FirebaseAdminStatus {
  available: boolean
  usingEmulators: boolean
  reason?: string
}

function configureEmulatorEnvironment(): boolean {
  const env = parseServerEnv(process.env)

  if (
    env.isProduction &&
    (env.firebaseAdmin.firestoreEmulatorHost || env.firebaseAdmin.authEmulatorHost)
  ) {
    throw new ConfigurationError(
      "Les emulateurs Firebase ne peuvent pas etre actives en production.",
    )
  }

  if (!env.isProduction && env.firebaseAdmin.firestoreEmulatorHost) {
    process.env.FIRESTORE_EMULATOR_HOST = env.firebaseAdmin.firestoreEmulatorHost
  }

  if (!env.isProduction && env.firebaseAdmin.authEmulatorHost) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = env.firebaseAdmin.authEmulatorHost
  }

  return Boolean(
    !env.isProduction &&
    (env.firebaseAdmin.firestoreEmulatorHost || env.firebaseAdmin.authEmulatorHost),
  )
}

export function getFirebaseAdminStatus(): FirebaseAdminStatus {
  const env = parseServerEnv(process.env)

  if (env.firebaseAdmin.configured) {
    return {
      available: true,
      usingEmulators: Boolean(!env.isProduction && env.firebaseAdmin.firestoreEmulatorHost),
    }
  }

  return {
    available: false,
    usingEmulators: false,
    reason:
      "Firebase Admin n'est pas configure. Les operations serveur protegees restent indisponibles.",
  }
}

export function getFirebaseAdminApp(): App {
  const existingApp = getApps()[0]

  if (existingApp) {
    return existingApp
  }

  const env = parseServerEnv(process.env)

  if (
    !env.firebaseAdmin.configured ||
    !env.firebaseAdmin.projectId ||
    !env.firebaseAdmin.clientEmail ||
    !env.firebaseAdmin.privateKey
  ) {
    throw new FirebaseUnavailableError()
  }

  configureEmulatorEnvironment()

  return initializeApp({
    credential: cert({
      projectId: env.firebaseAdmin.projectId,
      clientEmail: env.firebaseAdmin.clientEmail,
      privateKey: env.firebaseAdmin.privateKey,
    }),
  })
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp())
}

export function getFirebaseAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp())
}
