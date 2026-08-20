import type { StoreProduct, StoreProductVariant } from "./catalog"

export interface ProductSelection {
  sizeId?: string | undefined
  colorId?: string | undefined
  quantity: number
}

export interface CartLine {
  lineId: string
  productId: string
  slug: string
  name: string
  sku: string
  variantId: string
  selectedSize: string
  selectedColor: string
  unitPrice: number
  quantity: number
  image: {
    src: string
    alt: string
  }
}

export interface SelectionResult {
  ok: boolean
  message?: string
  variant?: StoreProductVariant
}

export function createCartLineId(input: {
  productId: string
  variantId: string
  size: string
  color: string
}): string {
  return [input.productId, input.variantId, input.size, input.color].join(":")
}

export function findProductVariant(
  product: StoreProduct,
  selection: Pick<ProductSelection, "sizeId" | "colorId">,
): StoreProductVariant | undefined {
  return product.variants.find((variant) => {
    const sizeMatches = product.sizes.length === 0 || variant.sizeId === selection.sizeId
    const colorMatches = product.colors.length === 0 || variant.colorId === selection.colorId

    return sizeMatches && colorMatches
  })
}

export function validateProductSelection(
  product: StoreProduct,
  selection: ProductSelection,
): SelectionResult {
  if (product.sizes.length > 0 && !selection.sizeId) {
    return { ok: false, message: "Choisissez une taille avant d'ajouter ce produit." }
  }

  if (product.colors.length > 0 && !selection.colorId) {
    return { ok: false, message: "Choisissez une couleur avant d'ajouter ce produit." }
  }

  if (!Number.isInteger(selection.quantity) || selection.quantity < 1) {
    return { ok: false, message: "Choisissez une quantité valide." }
  }

  const variant = findProductVariant(product, selection)

  if (!variant) {
    return { ok: false, message: "Cette combinaison n'est pas disponible." }
  }

  if (variant.stock < selection.quantity) {
    return { ok: false, message: "Le stock indiqué ne permet pas cette quantité." }
  }

  return { ok: true, variant }
}

export function createCartLine(product: StoreProduct, selection: ProductSelection): CartLine {
  const validation = validateProductSelection(product, selection)

  if (!validation.ok || !validation.variant) {
    throw new Error(validation.message ?? "Sélection produit invalide.")
  }

  const selectedSize =
    product.sizes.find((size) => size.id === selection.sizeId)?.label ?? "Standard"
  const selectedColor =
    product.colors.find((color) => color.id === selection.colorId)?.name ?? "Non précisée"
  const image = product.images[0]

  return {
    lineId: createCartLineId({
      productId: product.id,
      variantId: validation.variant.id,
      size: selectedSize,
      color: selectedColor,
    }),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sku: validation.variant.sku || product.sku,
    variantId: validation.variant.id,
    selectedSize,
    selectedColor,
    unitPrice: product.price,
    quantity: selection.quantity,
    image: {
      src: image?.src ?? "",
      alt: image?.alt ?? product.name,
    },
  }
}

export function addCartLine(lines: CartLine[], nextLine: CartLine): CartLine[] {
  const existingLine = lines.find((line) => line.lineId === nextLine.lineId)

  if (!existingLine) {
    return [...lines, nextLine]
  }

  return lines.map((line) =>
    line.lineId === nextLine.lineId
      ? { ...line, quantity: line.quantity + nextLine.quantity }
      : line,
  )
}

export function updateCartLineQuantity(
  lines: CartLine[],
  lineId: string,
  quantity: number,
): CartLine[] {
  if (quantity < 1) {
    return lines.filter((line) => line.lineId !== lineId)
  }

  return lines.map((line) => (line.lineId === lineId ? { ...line, quantity } : line))
}

export function removeCartLine(lines: CartLine[], lineId: string): CartLine[] {
  return lines.filter((line) => line.lineId !== lineId)
}

export function getCartLineSubtotal(line: CartLine): number {
  return line.unitPrice * line.quantity
}

export function getCartTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + getCartLineSubtotal(line), 0)
}

export function getCartQuantity(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0)
}
