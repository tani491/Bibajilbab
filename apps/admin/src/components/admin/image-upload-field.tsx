"use client"

import { ImagePlus, UploadCloud, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { ChangeEvent, DragEvent } from "react"

import type { ProductImage } from "@bibajilbab/types"
import { Button } from "@bibajilbab/ui"

interface UploadResult {
  secureUrl: string
  publicId: string
  width?: number | undefined
  height?: number | undefined
}

function isUploadResponse(value: unknown): value is { uploads: UploadResult[] } {
  return Boolean(
    value && typeof value === "object" && Array.isArray((value as { uploads?: unknown }).uploads),
  )
}

function imageJson(image: ProductImage | null): string {
  return image ? JSON.stringify(image) : ""
}

function friendlyUploadError(message: string): string {
  return message.toLowerCase().includes("cloudinary")
    ? "Configuration image incomplète. Ajoutez les variables serveur ou collez une URL."
    : message
}

export function ImageUploadField({
  defaultImage,
  folder,
  label = "Image de couverture",
}: {
  defaultImage?: ProductImage | undefined
  folder: string
  label?: string
}) {
  const [image, setImage] = useState<ProductImage | null>(defaultImage ?? null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [manualUrl, setManualUrl] = useState(defaultImage?.url ?? "")
  const [alt, setAlt] = useState(defaultImage?.alt ?? "")
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)

  async function uploadFile(file: File) {
    setError("")
    setUploading(true)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const body = new FormData()
      body.set("folder", folder)
      body.append("files", file)

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

      if (!isUploadResponse(payload) || !payload.uploads[0]) {
        throw new Error("Réponse de téléversement invalide.")
      }

      const upload = payload.uploads[0]
      const nextImage: ProductImage = {
        id: upload.publicId,
        url: upload.secureUrl,
        cloudinaryPublicId: upload.publicId,
        alt: alt || file.name.replace(/\.[^.]+$/u, "") || "Image de couverture",
        width: upload.width,
        height: upload.height,
        position: 0,
      }

      setImage(nextImage)
      setManualUrl(nextImage.url)
      setAlt(nextImage.alt)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? friendlyUploadError(uploadError.message)
          : "Téléversement impossible. Vous pouvez coller une URL.",
      )
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      void uploadFile(file)
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      void uploadFile(file)
    }
  }

  function applyManualImage() {
    const url = manualUrl.trim()

    if (!url) {
      setImage(null)
      return
    }

    setImage({
      url,
      alt: alt.trim() || label,
      position: 0,
    })
    setPreviewUrl("")
  }

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="imageJson" value={imageJson(image)} />
      <div className="rounded-card border border-brand-border bg-white p-4">
        <p className="text-sm font-semibold text-brand-ink">{label}</p>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="mt-3 rounded-card border border-dashed border-brand-powder bg-brand-blush p-4 text-center"
        >
          <ImagePlus aria-hidden="true" className="mx-auto h-7 w-7 text-brand-plum" />
          <p className="mt-2 text-sm text-brand-muted">Glissez une image ou sélectionnez-la.</p>
          <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-card bg-brand-plum px-4 text-sm font-medium text-white transition hover:bg-brand-mauve focus-within:shadow-focus">
            <UploadCloud aria-hidden="true" className="h-4 w-4" />
            Choisir une image
            <input type="file" accept="image/*,video/*" onChange={handleFileInput} className="sr-only" />
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="url"
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            onBlur={applyManualImage}
            placeholder="URL de l'image"
            className="h-11 rounded-card border border-brand-border px-3 text-sm"
          />
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            onBlur={applyManualImage}
            placeholder="Description de l'image"
            className="h-11 rounded-card border border-brand-border px-3 text-sm"
          />
          <Button type="button" variant="outline" onClick={applyManualImage}>
            Appliquer
          </Button>
        </div>

        {uploading ? <p className="mt-3 text-sm text-brand-muted">Téléversement...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {image || previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-card border border-brand-border bg-white">
            <div className="relative aspect-[16/9] bg-brand-blush">
              <Image
                src={image?.url || previewUrl}
                alt={image?.alt || alt || label}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                unoptimized
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setPreviewUrl("")
                  setManualUrl("")
                }}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-plum shadow-soft transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
                aria-label="Retirer l'image"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
