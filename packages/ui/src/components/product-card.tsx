import { ShoppingBag } from "lucide-react"
import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "../lib/cn"
import { Badge } from "./badge"

export interface ProductCardProps extends HTMLAttributes<HTMLElement> {
  name: string
  category: string
  price: string
  oldPrice?: string | undefined
  badge?: string
  imageLabel?: string
  media?: ReactNode
  colors?: string[]
  sizes?: string[]
}

export function ProductCard({
  className,
  name,
  category,
  price,
  oldPrice,
  badge,
  imageLabel = "Apercu produit",
  media,
  colors = [],
  sizes = [],
  ...props
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-card border border-brand-border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",
        className,
      )}
      {...props}
    >
      <div
        role={media ? undefined : "img"}
        aria-label={media ? undefined : imageLabel}
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-brand-blush"
      >
        {media ?? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand-border bg-white text-brand-plum transition duration-200 group-hover:scale-105">
            <ShoppingBag aria-hidden="true" className="h-8 w-8" />
          </div>
        )}
        {badge ? (
          <Badge className="absolute left-3 top-3" variant="plum">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-medium uppercase text-brand-muted">{category}</p>
          <h3 className="mt-1 text-base font-semibold text-brand-ink">{name}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold text-brand-plum">{price}</p>
          {oldPrice ? <p className="text-sm text-brand-muted line-through">{oldPrice}</p> : null}
        </div>
        {colors.length > 0 || sizes.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
            {colors.map((color) => (
              <span key={color} className="rounded-full border border-brand-border px-2 py-1">
                {color}
              </span>
            ))}
            {sizes.map((size) => (
              <span key={size} className="rounded-full border border-brand-border px-2 py-1">
                {size}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
