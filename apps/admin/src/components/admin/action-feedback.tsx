"use client"

import { useActionState } from "react"
import type { ReactNode } from "react"

import { Button } from "@bibajilbab/ui"

import type { ActionState } from "@/lib/admin-actions"

const initialState: ActionState = { ok: false, message: "" }

function readableActionMessage(message: string): string {
  try {
    const parsed: unknown = JSON.parse(message)

    if (Array.isArray(parsed)) {
      const firstMessage = parsed.find(
        (item): item is { message: string } =>
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          typeof item.message === "string",
      )

      if (firstMessage) {
        return firstMessage.message
      }
    }
  } catch {
    // Keep the original message when it is already human-readable.
  }

  return message
}

export function ActionForm({
  action,
  children,
  submitLabel,
  danger = false,
}: {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>
  children: ReactNode
  submitLabel: string
  danger?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-4" data-guard-unsaved="true">
      {children}
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-card border border-green-200 bg-green-50 p-3 text-sm text-green-900"
              : "rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-900"
          }
        >
          <p>{readableActionMessage(state.message)}</p>
          {state.resetLink ? (
            <p className="mt-2 break-all text-xs">
              Lien temporaire sécurisé : <span>{state.resetLink}</span>
            </p>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" isLoading={pending} variant={danger ? "danger" : "primary"}>
        {submitLabel}
      </Button>
    </form>
  )
}
