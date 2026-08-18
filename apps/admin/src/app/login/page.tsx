import Link from "next/link"

import { brandConfig } from "@bibajilbab/config"
import { Card, CardContent, Container } from "@bibajilbab/ui/server"

import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Connexion",
}

function resolveNextPath(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value

  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/login")) {
    return "/"
  }

  return path
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const nextPath = resolveNextPath((await searchParams).next)

  return (
    <main className="min-h-screen bg-brand-blush text-brand-ink">
      <Container className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-brand-border bg-white shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-plum">
                Administration privée
              </p>
              <h1 className="mt-3 font-serif text-4xl font-semibold text-brand-ink">
                {brandConfig.name}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-brand-muted">
                Espace de gestion interne du catalogue.
              </p>
            </div>
            <p className="mb-5 rounded-card border border-brand-border bg-brand-blush px-4 py-3 text-center text-xs leading-5 text-brand-muted">
              Connexion réservée aux comptes autorisés. Aucun formulaire d'inscription public n'est
              disponible.
            </p>
            <div>
              <LoginForm nextPath={nextPath} />
            </div>
            <Link
              className="mt-5 inline-flex w-full justify-center text-sm font-medium text-brand-plum transition hover:text-brand-mauve focus-visible:outline-none focus-visible:shadow-focus"
              href="/reset-password"
            >
              Mot de passe oublié
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  )
}
