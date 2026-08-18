import Link from "next/link"

import { Container, ErrorState, buttonStyles } from "@bibajilbab/ui/server"

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-brand-blush py-16">
      <Container>
        <ErrorState
          title="Accès non autorisé"
          description="Votre rôle ne permet pas d'accéder à cette section administrative."
          action={
            <Link href="/" className={buttonStyles()}>
              Retour au tableau de bord
            </Link>
          }
        />
      </Container>
    </main>
  )
}
