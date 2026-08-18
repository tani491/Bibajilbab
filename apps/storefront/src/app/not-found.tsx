import Link from "next/link"

import { Container, EmptyState, buttonStyles } from "@bibajilbab/ui/server"

export default function NotFoundPage() {
  return (
    <main className="py-16">
      <Container>
        <EmptyState
          title="Page introuvable"
          description="Cette page n'existe pas ou le produit demandé n'est plus publié."
          action={
            <Link className={buttonStyles()} href="/catalogue">
              Retour au catalogue
            </Link>
          }
        />
      </Container>
    </main>
  )
}
