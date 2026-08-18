export type AppErrorCode =
  | "CONFIGURATION_ERROR"
  | "FIREBASE_UNAVAILABLE"
  | "CLOUDINARY_UNAVAILABLE"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "AUTHORIZATION_ERROR"

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR", 500)
    this.name = "ConfigurationError"
  }
}

export class FirebaseUnavailableError extends AppError {
  constructor() {
    super("Firebase n'est pas configure ou indisponible.", "FIREBASE_UNAVAILABLE", 503)
    this.name = "FirebaseUnavailableError"
  }
}

export class CloudinaryUnavailableError extends AppError {
  constructor() {
    super("Cloudinary n'est pas configure ou indisponible.", "CLOUDINARY_UNAVAILABLE", 503)
    this.name = "CloudinaryUnavailableError"
  }
}

export function getPublicErrorMessage(error: unknown, isProduction: boolean): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (isProduction) {
    return "Une erreur est survenue. Veuillez reessayer plus tard."
  }

  return error instanceof Error ? error.message : "Erreur inconnue."
}
