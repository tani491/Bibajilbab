import "server-only"

import { v2 as cloudinary } from "cloudinary"

import { CloudinaryUnavailableError, parseServerEnv } from "@bibajilbab/config"

export interface CloudinarySignedUpload {
  apiKey: string
  cloudName: string
  folder: string
  signature: string
  timestamp: number
}

export interface CloudinaryServerStatus {
  available: boolean
  reason?: string
}

export function getCloudinaryServerStatus(): CloudinaryServerStatus {
  const env = parseServerEnv(process.env)

  if (env.cloudinary.configured) {
    return { available: true }
  }

  return {
    available: false,
    reason:
      "Cloudinary n'est pas configure. Les images locales de demonstration restent disponibles en developpement.",
  }
}

export function getCloudinaryServer() {
  const env = parseServerEnv(process.env)

  if (
    !env.cloudinary.configured ||
    !env.cloudinary.cloudName ||
    !env.cloudinary.apiKey ||
    !env.cloudinary.apiSecret
  ) {
    throw new CloudinaryUnavailableError()
  }

  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })

  return cloudinary
}

export function createCloudinaryUploadSignature(folder?: string): CloudinarySignedUpload {
  const env = parseServerEnv(process.env)
  const cloudinaryServer = getCloudinaryServer()
  const timestamp = Math.round(Date.now() / 1000)
  const uploadFolder = folder ?? env.cloudinary.uploadFolder

  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new CloudinaryUnavailableError()
  }

  const signature = cloudinaryServer.utils.api_sign_request(
    {
      folder: uploadFolder,
      timestamp,
    },
    env.cloudinary.apiSecret,
  )

  return {
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
    folder: uploadFolder,
    signature,
    timestamp,
  }
}
