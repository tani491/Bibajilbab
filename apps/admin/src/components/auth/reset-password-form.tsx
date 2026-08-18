"use client"

import { sendPasswordResetEmail } from "@firebase/auth"
import { useState } from "react"
import type { FormEvent } from "react"

import { Button, Input } from "@bibajilbab/ui"

import { getFirebaseClientAuth, getFirebaseClientStatus } from "@/lib/firebase/client"

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const firebaseStatus = getFirebaseClientStatus()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    try {
      await sendPasswordResetEmail(getFirebaseClientAuth(), email)
      setMessage("Si ce compte existe, un e-mail de réinitialisation Firebase a été envoyé.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Réinitialisation impossible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!firebaseStatus.available ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
          {firebaseStatus.reason}
        </div>
      ) : null}
      <Input
        label="E-mail administrateur"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      {message ? <p className="text-sm text-green-800">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={!firebaseStatus.available || loading}>
        Envoyer le lien
      </Button>
    </form>
  )
}
