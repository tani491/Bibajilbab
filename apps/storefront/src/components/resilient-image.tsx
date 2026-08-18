"use client"

import Image from "next/image"
import { useState } from "react"

import { fallbackProductImage } from "@bibajilbab/config/images"

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
  fallbackSrc = fallbackProductImage,
}: ResilientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
