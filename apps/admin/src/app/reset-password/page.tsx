import Link from "next/link"

import { Card, CardContent, Container } from "@bibajilbab/ui/server"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = {
  title: "Réinitialisation",
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-brand-blush">
      <Container className="flex min-h-screen items-center justify-center py-10">
        <Card className="w-full max-w-md">
          <CardContent>
            <p className="text-sm font-semibold uppercase text-brand-plum">Compte administrateur</p>
            <h1 className="mt-3 text-3xl font-semibold text-brand-ink">
              Réinitialiser le mot de passe
            </h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              Firebase envoie l'e-mail uniquement pour un compte administrateur existant.
            </p>
            <div className="mt-6">
              <ResetPasswordForm />
            </div>
            <Link
              className="mt-5 inline-flex text-sm font-medium text-brand-plum hover:text-brand-mauve"
              href="/login"
            >
              Retour à la connexion
            </Link>
          </CardContent>
        </Card>
      </Container>
    </main>
  )
}
