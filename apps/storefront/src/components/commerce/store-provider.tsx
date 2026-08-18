"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import {
  addCartLine,
  getCartQuantity,
  getCartTotal,
  removeCartLine,
  updateCartLineQuantity,
  type CartLine,
} from "@/lib/cart"
import {
  cartStorageKey,
  favoritesStorageKey,
  isStringArray,
  readJsonStorage,
  recentlyViewedStorageKey,
  writeJsonStorage,
} from "@/lib/local-storage"

interface StorefrontState {
  favorites: string[]
  cartLines: CartLine[]
  recentlyViewed: string[]
  favoriteCount: number
  cartCount: number
  cartTotal: number
  isFavorite: (slug: string) => boolean
  toggleFavorite: (slug: string) => void
  addFavorite: (slug: string) => void
  removeFavorite: (slug: string) => void
  addToCart: (line: CartLine) => void
  updateCartQuantity: (lineId: string, quantity: number) => void
  removeFromCart: (lineId: string) => void
  clearCart: () => void
  registerRecentlyViewed: (slug: string) => void
}

const StorefrontContext = createContext<StorefrontState | undefined>(undefined)

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.lineId === "string" &&
    typeof candidate.productId === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.sku === "string" &&
    typeof candidate.variantId === "string" &&
    typeof candidate.selectedSize === "string" &&
    typeof candidate.selectedColor === "string" &&
    typeof candidate.unitPrice === "number" &&
    typeof candidate.quantity === "number" &&
    typeof candidate.image === "object" &&
    candidate.image !== null
  )
}

function isCartLineArray(value: unknown): value is CartLine[] {
  return Array.isArray(value) && value.every(isCartLine)
}

function getStorage() {
  if (typeof window === "undefined") {
    return undefined
  }

  return window.localStorage
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    const storage = getStorage()
    setFavorites(readJsonStorage(storage, favoritesStorageKey, [], isStringArray))
    setCartLines(readJsonStorage(storage, cartStorageKey, [], isCartLineArray))
    setRecentlyViewed(readJsonStorage(storage, recentlyViewedStorageKey, [], isStringArray))
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return

    writeJsonStorage(getStorage(), favoritesStorageKey, favorites)
  }, [favorites, storageReady])

  useEffect(() => {
    if (!storageReady) return

    writeJsonStorage(getStorage(), cartStorageKey, cartLines)
  }, [cartLines, storageReady])

  useEffect(() => {
    if (!storageReady) return

    writeJsonStorage(getStorage(), recentlyViewedStorageKey, recentlyViewed)
  }, [recentlyViewed, storageReady])

  const addFavorite = useCallback((slug: string) => {
    setFavorites((current) => (current.includes(slug) ? current : [...current, slug]))
  }, [])

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((current) => current.filter((favorite) => favorite !== slug))
  }, [])

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((current) =>
      current.includes(slug) ? current.filter((favorite) => favorite !== slug) : [...current, slug],
    )
  }, [])

  const addToCart = useCallback((line: CartLine) => {
    setCartLines((current) => addCartLine(current, line))
  }, [])

  const updateCartQuantity = useCallback((lineId: string, quantity: number) => {
    setCartLines((current) => updateCartLineQuantity(current, lineId, quantity))
  }, [])

  const removeFromCart = useCallback((lineId: string) => {
    setCartLines((current) => removeCartLine(current, lineId))
  }, [])

  const clearCart = useCallback(() => {
    setCartLines([])
  }, [])

  const registerRecentlyViewed = useCallback((slug: string) => {
    setRecentlyViewed((current) => [slug, ...current.filter((item) => item !== slug)].slice(0, 6))
  }, [])

  const value = useMemo<StorefrontState>(
    () => ({
      favorites,
      cartLines,
      recentlyViewed,
      favoriteCount: favorites.length,
      cartCount: getCartQuantity(cartLines),
      cartTotal: getCartTotal(cartLines),
      isFavorite: (slug) => favorites.includes(slug),
      toggleFavorite,
      addFavorite,
      removeFavorite,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      registerRecentlyViewed,
    }),
    [
      addFavorite,
      addToCart,
      cartLines,
      clearCart,
      favorites,
      recentlyViewed,
      registerRecentlyViewed,
      removeFavorite,
      removeFromCart,
      toggleFavorite,
      updateCartQuantity,
    ],
  )

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>
}

export function useStorefrontState(): StorefrontState {
  const context = useContext(StorefrontContext)

  if (!context) {
    throw new Error("useStorefrontState doit etre utilise dans StoreProvider.")
  }

  return context
}
