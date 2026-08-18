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
