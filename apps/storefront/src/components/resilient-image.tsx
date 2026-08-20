"use client"

import Image from "next/image"
import { useState } from "react"

export interface ResilientImageProps {
  src: string
  alt: string
  sizes: string
  className?: string
  fallbackSrc?: string
}

export function ResilientImage({
  src,
  alt,
  sizes,
  className,
  fallbackSrc,
}: ResilientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)

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
