export const adminImageMaxBytes = 5 * 1024 * 1024
export const adminVideoMaxBytes = 50 * 1024 * 1024
export const allowedAdminImageMimeTypes = new Set([
  "image/avif",
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

export function validateAdminImageFile(file: UploadFileLike): string | null {
  if (!allowedAdminImageMimeTypes.has(file.type)) {
    return "Format image refusé. Utilisez AVIF, JPG, PNG ou WebP."
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
  if (file.type.startsWith("video/")) {
    if (!new Set(["video/mp4", "video/webm"]).has(file.type)) {
      return "Format vidéo refusé. Utilisez MP4 ou WebM."
    }

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
