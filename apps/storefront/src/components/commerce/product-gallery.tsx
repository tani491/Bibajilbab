"use client"

import { Maximize2 } from "lucide-react"
import { useState } from "react"
import type { TouchEvent } from "react"

import { Dialog, IconButton, cn } from "@bibajilbab/ui"

import { ResilientImage } from "@/components/resilient-image"
import type { StoreProduct } from "@/lib/catalog"

export function ProductGallery({ product }: { product: StoreProduct }) {
  const galleryImages = product.images.slice(0, 4)
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0]

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0]

    if (touchStartX === null || galleryImages.length < 2 || !touch) {
      return
    }

    const delta = touch.clientX - touchStartX
    if (Math.abs(delta) >= 40) {
      setActiveIndex((current) =>
        delta < 0
          ? (current + 1) % galleryImages.length
          : (current - 1 + galleryImages.length) % galleryImages.length,
      )
    }
    setTouchStartX(null)
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-card border border-brand-border bg-brand-blush"
        onTouchStart={(event) => {
          const touch = event.touches[0]
          if (touch) {
            setTouchStartX(touch.clientX)
          }
        }}
        onTouchEnd={handleTouchEnd}
      >
        {activeImage ? (
          <ResilientImage
            src={activeImage.src}
            alt={activeImage.alt}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-blush" aria-label="Image indisponible" />
        )}
        <IconButton
          className="absolute bottom-3 right-3 bg-white/95"
          label="Agrandir l'image produit"
          icon={<Maximize2 aria-hidden="true" className="h-5 w-5" />}
          onClick={() => setZoomOpen(true)}
        />
      </div>
      {galleryImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-card border-2 bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus",
                activeIndex === index
                  ? "border-brand-plum ring-2 ring-brand-powder"
                  : "border-brand-border",
              )}
              aria-label={`Afficher l'image ${index + 1}`}
            >
              <ResilientImage
                src={image.src}
                alt={image.alt}
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        title={product.name}
        description="Aperçu agrandi de l'image produit"
        className="max-w-3xl"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-brand-blush">
          {activeImage ? (
            <ResilientImage
              src={activeImage.src}
              alt={activeImage.alt}
              sizes="90vw"
              className="object-contain"
            />
          ) : (
            <div className="h-full w-full bg-brand-blush" aria-label="Image indisponible" />
          )}
        </div>
      </Dialog>
    </div>
  )
}
