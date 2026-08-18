export interface StockVariant {
  id: string
  stock: number
  lowStockThreshold: number
  status: "active" | "inactive"
}

export function applyStockAdjustment({
  variant,
  delta,
}: {
  variant: StockVariant
  delta: number
}): StockVariant {
  const nextStock = variant.stock + delta

  if (nextStock < 0) {
    throw new Error("Le stock ne peut pas devenir négatif.")
  }

  return {
    ...variant,
    stock: nextStock,
    status: nextStock === 0 ? "inactive" : variant.status,
  }
}

export function isLowStock(variant: Pick<StockVariant, "stock" | "lowStockThreshold">): boolean {
  return variant.stock > 0 && variant.stock <= variant.lowStockThreshold
}
