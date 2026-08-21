"use client"

import { useState } from "react"
import { UploadCloud } from "lucide-react"

import { Button } from "@bibajilbab/ui"

interface CloudinaryUploadResult {
  secureUrl: string
  publicId: string
  width?: number | undefined
  height?: number | undefined
  resourceType: string
}

function isUploadResponse(value: unknown): value is { uploads: CloudinaryUploadResult[] } {
  if (!value || typeof value !== "object") {
    return false
  }

  const item = value as Record<string, unknown>

  return Array.isArray(item.uploads)
}

function friendlyUploadError(message: string): string {
  return message.toLowerCase().includes("cloudinary")
    ? "Configuration image incomplète. Ajoutez les variables serveur ou collez une URL."
    : message
}

export function CloudinaryUploadPanel() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [results, setResults] = useState<CloudinaryUploadResult[]>([])
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload() {
    if (!files || files.length === 0) {
      setError("Sélectionnez au moins un fichier.")
      return
    }

    setError("")
    setIsUploading(true)

    try {
      const body = new FormData()
      body.set("folder", "bibajilbab/medias")
      Array.from(files).forEach((file) => body.append("files", file))

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body,
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" ? (payload as { error?: unknown }).error : null
        throw new Error(typeof message === "string" ? message : "Téléversement refusé.")
      }

      if (!isUploadResponse(payload)) {
        throw new Error("Réponse de téléversement invalide.")
      }

      setResults((current) => [...payload.uploads, ...current])
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? friendlyUploadError(uploadError.message)
          : "Téléversement impossible.",
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-card border border-brand-border bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="text-sm font-medium text-brand-ink md:flex-1">
            <span className="mb-2 block">Téléverser des médias</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => setFiles(event.target.files)}
            className="block w-full text-sm text-brand-muted file:mr-4 file:h-11 file:rounded-card file:border-0 file:bg-brand-plum file:px-4 file:text-sm file:font-medium file:text-white"
          />
        </label>
        <Button
          type="button"
          onClick={handleUpload}
          isLoading={isUploading}
          leftIcon={<UploadCloud aria-hidden="true" className="h-4 w-4" />}
        >
          Téléverser
        </Button>
      </div>

      {error ? (
        <p className="mt-4 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {results.map((result) => (
            <div
              key={result.publicId}
              className="rounded-card border border-brand-border bg-brand-blush p-3 text-sm text-brand-muted"
            >
              <p className="font-semibold text-brand-ink">Image téléversée</p>
              <p className="mt-1 break-all text-xs">{result.secureUrl}</p>
              <p className="mt-2 text-xs">
                Collez ce lien dans le formulaire ci-dessous pour l'ajouter à la galerie.
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
