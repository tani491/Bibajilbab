import { getApp, getApps, initializeApp } from "@firebase/app"
import type { FirebaseApp, FirebaseOptions } from "@firebase/app"
import { connectAuthEmulator, getAuth } from "@firebase/auth"
import type { Auth } from "@firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "@firebase/firestore"
import type { Firestore } from "@firebase/firestore"

import { FirebaseUnavailableError, parsePublicEnv } from "@bibajilbab/config"

declare global {
  var __BIBAJILBAB_FIREBASE_EMULATORS_CONNECTED__: boolean | undefined
}

export interface FirebaseClientStatus {
  available: boolean
  usingEmulators: boolean
  reason?: string
}

function splitHostPort(value: string): { host: string; port: number } {
  const [host, portValue] = value.split(":")
  const port = Number(portValue)

  if (!host || !Number.isInteger(port)) {
    throw new Error(`Hote emulateur Firebase invalide: ${value}`)
  }

  return { host, port }
}

function getFirebaseOptions(): FirebaseOptions | null {
  const env = parsePublicEnv(process.env)

  if (
    env.firebase.configured &&
    env.firebase.apiKey &&
    env.firebase.authDomain &&
    env.firebase.projectId &&
    env.firebase.storageBucket &&
    env.firebase.messagingSenderId &&
    env.firebase.appId
  ) {
    return {
      apiKey: env.firebase.apiKey,
      authDomain: env.firebase.authDomain,
      projectId: env.firebase.projectId,
      storageBucket: env.firebase.storageBucket,
      messagingSenderId: env.firebase.messagingSenderId,
      appId: env.firebase.appId,
    }
  }

  if (env.firebase.useEmulators) {
    return {
      apiKey: "demo-local-api-key",
      authDomain: "localhost",
      projectId: "bibajilbab-local",
      storageBucket: "bibajilbab-local.appspot.com",
      messagingSenderId: "000000000000",
      appId: "demo-local-app",
    }
  }

  return null
}

function connectEmulatorsOnce(auth: Auth, firestore: Firestore): void {
  const env = parsePublicEnv(process.env)

  if (
    env.isProduction ||
    !env.firebase.useEmulators ||
    globalThis.__BIBAJILBAB_FIREBASE_EMULATORS_CONNECTED__
  ) {
    return
  }

  const firestoreHost = splitHostPort(env.firebase.firestoreEmulatorHost)
  const authHost = splitHostPort(env.firebase.authEmulatorHost)

  connectFirestoreEmulator(firestore, firestoreHost.host, firestoreHost.port)
  connectAuthEmulator(auth, `http://${authHost.host}:${authHost.port}`, { disableWarnings: true })
  globalThis.__BIBAJILBAB_FIREBASE_EMULATORS_CONNECTED__ = true
}

export function getFirebaseClientStatus(): FirebaseClientStatus {
  const env = parsePublicEnv(process.env)

  if (env.firebase.configured) {
    return {
      available: true,
      usingEmulators: false,
    }
  }

  if (env.firebase.useEmulators) {
    return {
      available: true,
      usingEmulators: true,
      reason: "Configuration locale de demonstration utilisee pour les emulateurs Firebase.",
    }
  }

  return {
    available: false,
    usingEmulators: false,
    reason:
      "Firebase client n'est pas configure. Les donnees de demonstration locales restent disponibles en developpement.",
  }
}

export function getFirebaseClientApp(): FirebaseApp {
  const options = getFirebaseOptions()

  if (!options) {
    throw new FirebaseUnavailableError()
  }

  return getApps().length > 0 ? getApp() : initializeApp(options)
}

export function getFirebaseClientAuth(): Auth {
  const app = getFirebaseClientApp()
  const auth = getAuth(app)
  const firestore = getFirestore(app)
  connectEmulatorsOnce(auth, firestore)

  return auth
}

export function getFirebaseClientFirestore(): Firestore {
  const app = getFirebaseClientApp()
  const auth = getAuth(app)
  const firestore = getFirestore(app)
  connectEmulatorsOnce(auth, firestore)

  return firestore
}
