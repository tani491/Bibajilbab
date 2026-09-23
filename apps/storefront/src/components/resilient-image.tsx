"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

const DEFAULT_FALLBACK_SRC = "/demo/image-placeholder.svg"

export interface ResilientImageProps {
  src: string
  alt: string
  sizes: string
  className?: string
  fallbackSrc?: string
  priority?: boolean
}

export function ResilientImage({
  src,
  alt,
  sizes,
  className,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  priority = false,
}: ResilientImageProps) {
  const initialSrc = useMemo(() => src.trim() || fallbackSrc, [fallbackSrc, src])
  const [currentSrc, setCurrentSrc] = useState(initialSrc)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setCurrentSrc(initialSrc)
    setFailed(false)
  }, [initialSrc])

  if (failed) {
    return <div className="h-full w-full bg-brand-blush" aria-label="Image indisponible" />
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
