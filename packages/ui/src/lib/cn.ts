type ClassDictionary = Record<string, boolean | null | undefined>
type ClassArray = ClassValue[]
export type ClassValue = string | false | null | undefined | ClassDictionary | ClassArray

function normalizeClassValue(value: ClassValue): string[] {
  if (!value) {
    return []
  }

  if (typeof value === "string") {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeClassValue(entry))
  }

  return Object.entries(value)
    .filter((entry) => Boolean(entry[1]))
    .map((entry) => entry[0])
}

export function cn(...values: ClassValue[]): string {
  return values.flatMap((value) => normalizeClassValue(value)).join(" ")
}
