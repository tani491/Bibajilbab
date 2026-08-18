import { z } from "zod"

export const appEnvSchema = z.enum(["development", "test", "production"])
export type AppEnv = z.infer<typeof appEnvSchema>

const requiredString = z.string().trim().min(1)
const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
)
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
)
const optionalBoolean = z
  .preprocess((value) => {
    if (typeof value === "boolean") {
      return value
    }

    if (typeof value !== "string") {
      return value
    }

    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) {
      return true
    }

    if (["false", "0", "no", "off"].includes(value.toLowerCase())) {
      return false
    }

    return value
  }, z.boolean())
  .optional()

function resolveAppEnv(env: NodeJS.ProcessEnv): AppEnv {
  const explicitEnv = env.APP_ENV ?? env.NEXT_PUBLIC_APP_ENV

  if (explicitEnv) {
    return appEnvSchema.parse(explicitEnv)
  }

  if (env.NODE_ENV === "test") {
    return "test"
  }

  if (env.NODE_ENV === "production") {
    return "production"
  }

  return "development"
}

function assertLocalOnlyFlag(
  enabled: boolean | undefined,
  flagName: string,
  env: NodeJS.ProcessEnv,
): void {
  if (!enabled) {
    return
  }

  if (env.NODE_ENV !== "development") {
    throw new Error(`${flagName} est reserve au developpement local et exige NODE_ENV=development.`)
  }
}

function defaultStorefrontUrl(appEnv: AppEnv): string {
  return appEnv === "production" ? "https://bibajilbab.com" : "http://localhost:3000"
}

function defaultAdminUrl(appEnv: AppEnv): string {
  return appEnv === "production" ? "https://admin.bibajilbab.com" : "http://localhost:3001"
}

function allPresent(values: Array<string | undefined>): boolean {
  return values.every((value) => Boolean(value && value.trim().length > 0))
}

function normalizePrivateKey(value: string | undefined): string | undefined {
  return value?.replace(/\\n/g, "\n")
}

export const rawPublicEnvSchema = z.object({
  APP_ENV: appEnvSchema.optional(),
  NEXT_PUBLIC_APP_ENV: appEnvSchema.optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_STOREFRONT_URL: optionalUrl,
  NEXT_PUBLIC_ADMIN_URL: optionalUrl,
  NEXT_PUBLIC_WHATSAPP_NUMBER: optionalString,
  NEXT_PUBLIC_INSTAGRAM_URL: optionalUrl,
  NEXT_PUBLIC_TIKTOK_URL: optionalUrl,
  NEXT_PUBLIC_ENABLE_DEMO_ADMIN: optionalBoolean,
  NEXT_PUBLIC_DEMO_ADMIN_EMAIL: optionalString,
  NEXT_PUBLIC_DEMO_ADMIN_PASSWORD: optionalString,
  NEXT_PUBLIC_ENABLE_DEMO_DATA: optionalBoolean,
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: optionalBoolean,
  NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: optionalString,
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: optionalString,
  NEXT_PUBLIC_FIREBASE_API_KEY: optionalString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optionalString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optionalString,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_APP_ID: optionalString,
  NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY: optionalString,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalString,
})

export const rawServerEnvSchema = z.object({
  ADMIN_MOCK_AUTH: optionalBoolean,
  ADMIN_MOCK_EMAIL: optionalString,
  ADMIN_MOCK_PASSWORD: optionalString,
  FIREBASE_ADMIN_PROJECT_ID: optionalString,
  FIREBASE_ADMIN_CLIENT_EMAIL: optionalString,
  FIREBASE_ADMIN_PRIVATE_KEY: optionalString,
  FIREBASE_PROJECT_ID: optionalString,
  FIREBASE_CLIENT_EMAIL: optionalString,
  FIREBASE_PRIVATE_KEY: optionalString,
  FIRESTORE_EMULATOR_HOST: optionalString,
  FIREBASE_AUTH_EMULATOR_HOST: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CLOUDINARY_UPLOAD_FOLDER: optionalString,
})

export const productionPublicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_STOREFRONT_URL: z.string().url(),
  NEXT_PUBLIC_ADMIN_URL: z.string().url(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: requiredString,
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().url(),
  NEXT_PUBLIC_TIKTOK_URL: z.string().url(),
  NEXT_PUBLIC_FIREBASE_API_KEY: requiredString,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: requiredString,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: requiredString,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: requiredString,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: requiredString,
  NEXT_PUBLIC_FIREBASE_APP_ID: requiredString,
  NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY: optionalString,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: requiredString,
})

export const productionServerEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: requiredString,
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: requiredString,
  CLOUDINARY_API_KEY: requiredString,
  CLOUDINARY_API_SECRET: requiredString,
})

export interface PublicEnv {
  appEnv: AppEnv
  isDevelopment: boolean
  isTest: boolean
  isProduction: boolean
  urls: {
    site: string
    storefront: string
    admin: string
  }
  brand: {
    whatsappNumber: string
    instagramUrl: string
    tiktokUrl: string
  }
  demoAdmin: {
    enabled: boolean
    email: string
    password: string
  }
  demoDataEnabled: boolean
  firebase: {
    configured: boolean
    useEmulators: boolean
    firestoreEmulatorHost: string
    authEmulatorHost: string
    apiKey: string | undefined
    authDomain: string | undefined
    projectId: string | undefined
    storageBucket: string | undefined
    messagingSenderId: string | undefined
    appId: string | undefined
    appCheckSiteKey: string | undefined
    appCheckConfigured: boolean
  }
  cloudinary: {
    configured: boolean
    cloudName: string | undefined
  }
}

export interface ServerEnv {
  appEnv: AppEnv
  isDevelopment: boolean
  isTest: boolean
  isProduction: boolean
  adminMockAuth: {
    enabled: boolean
    email: string
    password: string
  }
  firebaseAdmin: {
    configured: boolean
    projectId: string | undefined
    clientEmail: string | undefined
    privateKey: string | undefined
    firestoreEmulatorHost: string | undefined
    authEmulatorHost: string | undefined
  }
  cloudinary: {
    configured: boolean
    cloudName: string | undefined
    apiKey: string | undefined
    apiSecret: string | undefined
    uploadFolder: string
  }
}

export function parsePublicEnv(env: NodeJS.ProcessEnv): PublicEnv {
  const raw = rawPublicEnvSchema.parse(env)
  const appEnv = resolveAppEnv(env)
  assertLocalOnlyFlag(raw.NEXT_PUBLIC_ENABLE_DEMO_ADMIN, "NEXT_PUBLIC_ENABLE_DEMO_ADMIN", env)
  const storefrontUrl =
    raw.NEXT_PUBLIC_STOREFRONT_URL ?? raw.NEXT_PUBLIC_SITE_URL ?? defaultStorefrontUrl(appEnv)
  const adminUrl = raw.NEXT_PUBLIC_ADMIN_URL ?? defaultAdminUrl(appEnv)
  const siteUrl = raw.NEXT_PUBLIC_SITE_URL ?? storefrontUrl
  const firebaseConfigured = allPresent([
    raw.NEXT_PUBLIC_FIREBASE_API_KEY,
    raw.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    raw.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    raw.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    raw.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    raw.NEXT_PUBLIC_FIREBASE_APP_ID,
  ])
  const requestedDemoData = raw.NEXT_PUBLIC_ENABLE_DEMO_DATA ?? appEnv !== "production"
  const requestedEmulators = raw.NEXT_PUBLIC_USE_FIREBASE_EMULATORS ?? appEnv === "development"
  const requestedDemoAdmin = raw.NEXT_PUBLIC_ENABLE_DEMO_ADMIN ?? false
  const demoAdminEnabled = appEnv !== "production" && requestedDemoAdmin

  return {
    appEnv,
    isDevelopment: appEnv === "development",
    isTest: appEnv === "test",
    isProduction: appEnv === "production",
    urls: {
      site: siteUrl,
      storefront: storefrontUrl,
      admin: adminUrl,
    },
    brand: {
      whatsappNumber: raw.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "221770825302",
      instagramUrl: raw.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/bibajilbab97/",
      tiktokUrl: raw.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@habibabibajilbaba",
    },
    demoAdmin: {
      enabled: demoAdminEnabled,
      email: raw.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@bibajilbab.com",
      password: raw.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "BibaJilbabLocal2026!",
    },
    demoDataEnabled: appEnv !== "production" && requestedDemoData,
    firebase: {
      configured: firebaseConfigured,
      useEmulators: appEnv !== "production" && requestedEmulators,
      firestoreEmulatorHost: raw.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
      authEmulatorHost: raw.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099",
      apiKey: raw.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: raw.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: raw.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: raw.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: raw.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: raw.NEXT_PUBLIC_FIREBASE_APP_ID,
      appCheckSiteKey: raw.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY,
      appCheckConfigured: Boolean(raw.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY),
    },
    cloudinary: {
      configured: Boolean(raw.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
      cloudName: raw.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    },
  }
}

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  const raw = rawServerEnvSchema.parse(env)
  const appEnv = resolveAppEnv(env)
  assertLocalOnlyFlag(raw.ADMIN_MOCK_AUTH, "ADMIN_MOCK_AUTH", env)
  const projectId = raw.FIREBASE_ADMIN_PROJECT_ID ?? raw.FIREBASE_PROJECT_ID
  const clientEmail = raw.FIREBASE_ADMIN_CLIENT_EMAIL ?? raw.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(raw.FIREBASE_ADMIN_PRIVATE_KEY ?? raw.FIREBASE_PRIVATE_KEY)
  const firebaseAdminConfigured = allPresent([projectId, clientEmail, privateKey])
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const cloudinaryConfigured = allPresent([
    cloudName,
    raw.CLOUDINARY_API_KEY,
    raw.CLOUDINARY_API_SECRET,
  ])

  return {
    appEnv,
    isDevelopment: appEnv === "development",
    isTest: appEnv === "test",
    isProduction: appEnv === "production",
    adminMockAuth: {
      enabled: appEnv === "development" && (raw.ADMIN_MOCK_AUTH ?? false),
      email: raw.ADMIN_MOCK_EMAIL ?? "admin@bibajilbab.com",
      password: raw.ADMIN_MOCK_PASSWORD ?? "BibaJilbabLocal2026!",
    },
    firebaseAdmin: {
      configured: firebaseAdminConfigured,
      projectId,
      clientEmail,
      privateKey,
      firestoreEmulatorHost: raw.FIRESTORE_EMULATOR_HOST,
      authEmulatorHost: raw.FIREBASE_AUTH_EMULATOR_HOST,
    },
    cloudinary: {
      configured: cloudinaryConfigured,
      cloudName,
      apiKey: raw.CLOUDINARY_API_KEY,
      apiSecret: raw.CLOUDINARY_API_SECRET,
      uploadFolder: raw.CLOUDINARY_UPLOAD_FOLDER ?? "bibajilbab",
    },
  }
}

export function validateProductionEnv(env: NodeJS.ProcessEnv): void {
  const rawPublic = rawPublicEnvSchema.parse(env)
  const rawServer = rawServerEnvSchema.parse(env)

  if (rawPublic.NEXT_PUBLIC_ENABLE_DEMO_ADMIN || rawServer.ADMIN_MOCK_AUTH) {
    throw new Error("Configuration production invalide: le mode admin demo doit rester desactive.")
  }

  const publicResult = productionPublicEnvSchema.safeParse(env)
  const serverResult = productionServerEnvSchema.safeParse(env)

  if (publicResult.success && serverResult.success) {
    return
  }

  const publicErrors = publicResult.success
    ? []
    : publicResult.error.issues.map((issue) => issue.path.join("."))
  const serverErrors = serverResult.success
    ? []
    : serverResult.error.issues.map((issue) => issue.path.join("."))
  const missingKeys = [...publicErrors, ...serverErrors].filter(Boolean).join(", ")

  throw new Error(`Configuration production incomplete: ${missingKeys}`)
}
