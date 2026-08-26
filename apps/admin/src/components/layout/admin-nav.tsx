"use client"

import {
  Boxes,
  FileText,
  Images,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
  UsersRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@bibajilbab/ui"

import type { AdminRole, AdminSection } from "@/lib/permissions"

const editorSections = new Set<AdminSection>([
  "dashboard",
  "products",
  "media",
  "categories",
  "content",
  "testimonials",
  "requests",
  "inventory",
])

const navItems: Array<{
  href: string
  label: string
  section: AdminSection
  icon: LucideIcon
}> = [
  { href: "/", label: "Tableau de bord", section: "dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Produits", section: "products", icon: Package },
  { href: "/categories", label: "Catégories", section: "categories", icon: Tags },
  { href: "/inventory", label: "Stock", section: "inventory", icon: Boxes },
  { href: "/media", label: "Médias", section: "media", icon: Images },
  { href: "/requests", label: "Demandes WhatsApp", section: "requests", icon: ShoppingBag },
  { href: "/content", label: "Contenu", section: "content", icon: FileText },
  {
    href: "/testimonials",
    label: "Témoignages",
    section: "testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/users", label: "Utilisateurs", section: "users", icon: UsersRound },
  {
    href: "/settings",
    label: "Paramètres",
    section: "settings",
    icon: SlidersHorizontal,
  },
]

function canSeeSection(role: AdminRole, section: AdminSection): boolean {
  return role === "admin" || editorSections.has(section)
}

function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav({
  role,
  variant,
}: {
  role: AdminRole
  variant: "desktop" | "mobile"
}) {
  const pathname = usePathname()
  const visibleItems = navItems.filter((item) => canSeeSection(role, item.section))

  return (
    <nav
      className={cn(
        variant === "mobile"
          ? "no-scrollbar -mx-3 flex flex-nowrap gap-2 overflow-x-auto px-3 pb-1"
          : "flex flex-col gap-1 overflow-y-auto",
      )}
      aria-label="Navigation admin"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive = isActivePath(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 transform-gpu items-center gap-2 rounded-card px-3 text-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:shadow-focus",
              variant === "mobile" ? "shrink-0 whitespace-nowrap" : "w-full",
              isActive
                ? "bg-[#5c2444] font-semibold text-white shadow-sm"
                : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-[#5c2444]",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
