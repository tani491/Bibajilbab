export const adminImageMaxBytes = 5 * 1024 * 1024
export const adminVideoMaxBytes = 50 * 1024 * 1024
export const allowedAdminImageMimeTypes = new Set([
  "image/avif",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
])
const cloudinaryFolderPattern = /^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,119}$/

export interface UploadFileLike {
  name: string
  size: number
  type: string
}

function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function isVideoFile(file: UploadFileLike): boolean {
  return file.type.toLowerCase().startsWith("video/") ||
    ["mp4", "mov", "webm"].includes(fileExtension(file.name))
}

export function validateAdminImageFile(file: UploadFileLike): string | null {
  const mimeType = file.type.toLowerCase()
  const extension = fileExtension(file.name)
  const supportedImageExtension = ["avif", "heic", "heif", "jpg", "jpeg", "png", "webp"].includes(
    extension,
  )

  if (!allowedAdminImageMimeTypes.has(mimeType) && !supportedImageExtension) {
    return "Format image refusé. Utilisez JPG, PNG, WebP, HEIC ou HEIF."
  }

  if (file.size <= 0) {
    return "Fichier image vide."
  }

  if (file.size > adminImageMaxBytes) {
    return "Image trop lourde. Limite : 5 Mo."
  }

  return null
}

export function validateAdminMediaFile(file: UploadFileLike): string | null {
  if (isVideoFile(file)) {

    if (file.size <= 0) {
      return "Fichier vidéo vide."
    }

    if (file.size > adminVideoMaxBytes) {
      return "Vidéo trop lourde. Limite : 50 Mo."
    }

    return null
  }

  return validateAdminImageFile(file)
}

export function validateCloudinaryFolderName(folder: string): string | null {
  if (!cloudinaryFolderPattern.test(folder) || folder.includes("..") || folder.includes("//")) {
    return "Dossier Cloudinary invalide."
  }

  return null
}
