"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { signInWithEmailAndPassword } from "@firebase/auth"
import { AlertCircle, Lock, LockKeyhole, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button, Input } from "@bibajilbab/ui"

import { getFirebaseClientAuth, getFirebaseClientStatus } from "@/lib/firebase/client"
import { getAdminPublicEnv } from "@/lib/public-env"

const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  nextPath: string
}

const firebaseErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "Adresse e-mail ou mot de passe incorrect.",
  "auth/invalid-email": "Adresse e-mail invalide.",
  "auth/network-request-failed": "Connexion Firebase impossible. Vérifiez votre réseau.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/user-disabled": "Ce compte administrateur est désactivé.",
  "auth/user-not-found": "Aucun compte ne correspond à cette adresse e-mail.",
  "auth/wrong-password": "Mot de passe incorrect.",
}

function getErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code
  }

  return null
}

function getLoginErrorMessage(error: unknown): string {
  const code = getErrorCode(error)

  if (code && firebaseErrorMessages[code]) {
    return firebaseErrorMessages[code]
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "Le serveur admin ne répond pas. Vérifiez Firebase Admin et réessayez."
    }

    return error.message
  }

  return "Connexion impossible. Réessayez dans quelques instants."
}

async function requestJsonSession({
  body,
  endpoint,
  timeoutMs,
  timeoutMessage,
}: {
  body: LoginFormValues | { idToken: string; email: string }
  endpoint: string
  timeoutMs: number
  timeoutMessage: string
}): Promise<{ error?: string; ok?: boolean; role?: string }> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string
      ok?: boolean
      role?: string
    }

    if (!response.ok) {
      throw new Error(payload.error ?? "Connexion refusée.")
    }

    return payload
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(timeoutMessage)
    }

    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(message))
    }, timeoutMs)

    promise.then(
      (value) => {
        window.clearTimeout(timeout)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const publicEnv = getAdminPublicEnv()
  const demoAdmin = publicEnv.demoAdmin
  const firebaseStatus = getFirebaseClientStatus()
  const authAvailable = demoAdmin.enabled || firebaseStatus.available
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: demoAdmin.enabled ? demoAdmin.email : "",
      password: demoAdmin.enabled ? demoAdmin.password : "",
    },
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!demoAdmin.enabled) {
      return
    }

    reset({
      email: demoAdmin.email,
      password: demoAdmin.password,
    })
  }, [demoAdmin.email, demoAdmin.enabled, demoAdmin.password, reset])

  async function submitLogin(values: LoginFormValues) {
    try {
      if (demoAdmin.enabled) {
        await requestJsonSession({
          endpoint: "/api/auth/mock-session",
          body: values,
          timeoutMs: 8_000,
          timeoutMessage: "Le mode administrateur local ne répond pas. Relancez le serveur admin.",
        })
        router.replace(nextPath)
        return
      }

      const auth = getFirebaseClientAuth()
      const credential = await withTimeout(
        signInWithEmailAndPassword(auth, values.email, values.password),
        15_000,
        "Firebase ne répond pas. Vérifiez la configuration Auth et réessayez.",
      )
      const idToken = await credential.user.getIdToken()
      await requestJsonSession({
        endpoint: "/api/auth/session",
        body: { idToken, email: values.email },
        timeoutMs: 12_000,
        timeoutMessage: "Le serveur admin ne répond pas. Vérifiez Firebase Admin et réessayez.",
      })

      router.replace(nextPath)
    } catch (submitError) {
      setError("root", {
        message: getLoginErrorMessage(submitError),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(submitLogin)} className="space-y-5" noValidate>
      {demoAdmin.enabled ? (
        <div className="rounded-card border border-brand-border bg-brand-blush p-4 text-sm leading-6 text-brand-plum">
          Mode développement local actif. Les champs sont préremplis avec la session simulée.
        </div>
      ) : null}
      {!demoAdmin.enabled && !firebaseStatus.available ? (
        <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
          {firebaseStatus.reason ??
            "Configuration Firebase incomplète dans le fichier .env.local. Activez le mode admin local en développement ou renseignez les clés Firebase."}
        </div>
      ) : null}
      {errors.root?.message ? (
        <div
          className="flex gap-3 rounded-card border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors.root.message}</span>
        </div>
      ) : null}
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        leftIcon={<Mail aria-hidden="true" className="h-4 w-4" />}
        error={errors.email?.message}
        disabled={isSubmitting}
        required
        {...register("email")}
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        leftIcon={<Lock aria-hidden="true" className="h-4 w-4" />}
        error={errors.password?.message}
        disabled={isSubmitting}
        required
        {...register("password")}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={!isHydrated || !authAvailable || isSubmitting}
        isLoading={isSubmitting}
        leftIcon={<LockKeyhole aria-hidden="true" className="h-4 w-4" />}
      >
        {isSubmitting ? "Connexion..." : "Connexion"}
      </Button>
    </form>
  )
}
