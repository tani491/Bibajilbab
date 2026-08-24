export const fallbackProductImage = "/demo/image-placeholder.svg"

export function getCloudinaryBaseUrl(cloudName: string | undefined): string | null {
  if (!cloudName) {
    return null
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload`
}

export function getProductImageSrc(
  src: string | undefined,
  fallback = fallbackProductImage,
): string {
  return src && src.trim().length > 0 ? src : fallback
}

export function getOptimizedCloudinaryImageSrc(src: string | undefined): string | undefined {
  if (!src) {
    return undefined
  }

  const trimmed = src.trim()

  if (!trimmed.includes("res.cloudinary.com") || !trimmed.includes("/image/upload/")) {
    return trimmed
  }

  if (trimmed.includes("/f_auto") || trimmed.includes(",f_auto") || trimmed.includes("f_auto,")) {
    return trimmed
  }

  return trimmed.replace("/image/upload/", "/image/upload/f_auto,q_auto/")
}
