"use client"

import { sendPasswordResetEmail } from "@firebase/auth"
import { KeyRound } from "lucide-react"
import { useState } from "react"

import { Button } from "@bibajilbab/ui"

import { getFirebaseClientAuth, getFirebaseClientStatus } from "@/lib/firebase/client"

export function PasswordResetCard({ email, isMock }: { email: string; isMock?: boolean }) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const firebaseStatus = getFirebaseClientStatus()
  const disabled = loading || isMock || !firebaseStatus.available

  async function requestReset() {
    setMessage("")
    setError("")
    setLoading(true)

    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), email)
      setMessage("Un e-mail de modification du mot de passe a été envoyé.")
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Impossible d'envoyer le lien de modification.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-card border border-brand-border bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-brand-blush text-brand-plum">
          <KeyRound aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-ink">Mot de passe administrateur</h2>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            Envoyer un lien sécurisé à {email} pour définir un nouveau mot de passe.
          </p>
        </div>
      </div>
      {isMock ? (
        <p className="mt-4 rounded-card border border-brand-border bg-brand-blush p-3 text-sm text-brand-muted">
          La session locale simulée n'a pas de mot de passe Firebase à modifier.
        </p>
      ) : null}
      {!firebaseStatus.available && !isMock ? (
        <p className="mt-4 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {firebaseStatus.reason}
        </p>
      ) : null}
      {message ? <p className="mt-4 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <Button
        type="button"
        className="mt-5"
        onClick={requestReset}
        isLoading={loading}
        disabled={disabled}
      >
        Modifier mon mot de passe
      </Button>
    </div>
  )
}
