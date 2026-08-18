export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export const favoritesStorageKey = "bibajilbab:favorites"
export const cartStorageKey = "bibajilbab:cart"
export const recentlyViewedStorageKey = "bibajilbab:recently-viewed"

export function readJsonStorage<T>(
  storage: StorageLike | undefined,
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (!storage) {
    return fallback
  }

  try {
    const rawValue = storage.getItem(key)

    if (!rawValue) {
      return fallback
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    return isValid(parsedValue) ? parsedValue : fallback
  } catch {
    return fallback
  }
}

export function writeJsonStorage<T>(
  storage: StorageLike | undefined,
  key: string,
  value: T,
): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorageValue(storage: StorageLike | undefined, key: string): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}
