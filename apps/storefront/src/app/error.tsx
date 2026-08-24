"use client"

import { Button, ErrorState } from "@bibajilbab/ui"

export default function StorefrontError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="px-4 py-16">
      <ErrorState
        title="Une erreur est survenue"
        description="La boutique n'a pas pu afficher ce contenu. Réessayez dans quelques instants."
        action={<Button onClick={reset}>Réessayer</Button>}
        className="mx-auto max-w-xl"
      />
    </main>
  )
}
