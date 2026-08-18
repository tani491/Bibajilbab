import Link from "next/link"

export interface BreadcrumbItem {
  href: string
  label: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-brand-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link className="transition hover:text-brand-plum" href="/">
            Accueil
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link className="transition hover:text-brand-plum" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
