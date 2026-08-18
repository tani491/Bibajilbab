export function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat("fr-SN", {
    maximumFractionDigits: 0,
  }).format(amount)} FCFA`
}

export function parsePositiveInteger(value: string | null | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
