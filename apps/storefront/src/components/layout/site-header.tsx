"use client"

import { Heart, Menu, Search, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { FormEvent } from "react"

import { brandConfig } from "@bibajilbab/config"
import { Drawer, IconButton, Input, buttonStyles, cn } from "@bibajilbab/ui"

import { announcement, categories } from "@/lib/catalog"

import { useStorefrontState } from "../commerce/store-provider"

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/collections/nouveautes", label: "Nouveautés" },
  { href: "/categories/djilbabs", label: "Djilbabs" },
  { href: "/categories/khimars", label: "Khimars" },
  { href: "/categories/tuniques", label: "Tuniques" },
  { href: "/categories/priere", label: "Prière" },
  { href: "/collections/tabaski", label: "Tabaski" },
  { href: "/collections/korite", label: "Korité" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
]

function Counter({ value }: { value: number }) {
  if (value === 0) {
    return null
  }

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-plum px-1 text-[11px] font-semibold text-white">
      {value}
    </span>
  )
}

export function SiteHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { favoriteCount, cartCount } = useStorefrontState()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    router.push(trimmedQuery ? `/recherche?q=${encodeURIComponent(trimmedQuery)}` : "/recherche")
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/95 backdrop-blur">
      <a
        href={announcement.href}
        className="block bg-brand-blush px-4 py-2 text-center text-xs font-medium text-brand-ink transition hover:text-brand-plum focus-visible:outline-none focus-visible:shadow-focus"
      >
        {announcement.text}
      </a>
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 focus-visible:outline-none focus-visible:shadow-focus">
          <span className="block text-lg font-semibold text-brand-ink">{brandConfig.name}</span>
          <span className="block text-xs text-brand-muted">Catalogue modest fashion</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-sm font-medium text-brand-muted lg:flex">
          {navItems.slice(0, 8).map((item) => (
            <Link key={item.href} className="transition hover:text-brand-plum" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <form className="hidden w-full max-w-xs md:block" onSubmit={handleSearch}>
          <Input
            aria-label="Rechercher un produit"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher..."
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/favoris"
            className={cn(
              buttonStyles({ variant: "ghost", size: "sm" }),
              "relative h-11 w-11 px-0",
            )}
            aria-label={`Favoris, ${favoriteCount} article(s)`}
          >
            <Heart aria-hidden="true" className="h-5 w-5" />
            <Counter value={favoriteCount} />
          </Link>
          <Link
            href="/panier"
            className={cn(
              buttonStyles({ variant: "ghost", size: "sm" }),
              "relative h-11 w-11 px-0",
            )}
            aria-label={`Panier, ${cartCount} article(s)`}
          >
            <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            <Counter value={cartCount} />
          </Link>
          <IconButton
            className="lg:hidden"
            label="Ouvrir le menu"
            icon={<Menu aria-hidden="true" className="h-5 w-5" />}
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </div>

      <Drawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        description="Navigation de la boutique publique"
        side="right"
      >
        <form className="mb-6" onSubmit={handleSearch}>
          <Input
            label="Recherche"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Produit, couleur, collection..."
            leftIcon={<Search aria-hidden="true" className="h-4 w-4" />}
          />
        </form>
        <nav className="grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-card px-3 py-3 text-sm font-medium text-brand-ink transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-brand-border pt-6">
          <p className="mb-3 text-xs font-semibold uppercase text-brand-muted">Catégories</p>
          <div className="grid gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="rounded-card border border-brand-border px-3 py-3 text-sm text-brand-muted transition hover:border-brand-plum hover:text-brand-plum focus-visible:outline-none focus-visible:shadow-focus"
                onClick={() => setMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </header>
  )
}
