"use client"

import { ImagePlus, UploadCloud, Video, X } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"

import type { ProductImage } from "@bibajilbab/types"

interface UploadResult {
  secureUrl: string
  publicId: string
  width?: number | undefined
  height?: number | undefined
}

type HeroMedia = ProductImage & {
  kind: "image" | "video"
}

function isUploadResponse(value: unknown): value is { uploads: UploadResult[] } {
  return Boolean(
    value && typeof value === "object" && Array.isArray((value as { uploads?: unknown }).uploads),
  )
}

function createLocalId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `hero-${crypto.randomUUID()}`
  }

  return `hero-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function mediaJson(media: HeroMedia | null): string {
  return media ? JSON.stringify(media) : ""
}

function isVideoFile(file: File): boolean {
  return file.type === "video/mp4" || file.type === "video/webm"
}

function createLocalMedia(file: File, previewUrl: string): HeroMedia {
  return {
    id: createLocalId(),
    url: previewUrl,
    alt: file.name.replace(/\.[^.]+$/u, "") || "Média bannière",
    position: 0,
    kind: isVideoFile(file) ? "video" : "image",
  }
}

export function ProductHeroFields({
  defaultEnabled,
  defaultDesktopImage,
  defaultVideoUrl,
}: {
  defaultEnabled?: boolean | undefined
  defaultDesktopImage?: ProductImage | undefined
  defaultVideoUrl?: string | undefined
}) {
  const defaultMedia = useMemo<HeroMedia | null>(() => {
    if (defaultVideoUrl) {
      return {
        id: "hero-video",
        url: defaultVideoUrl,
        alt: "Vidéo bannière",
        position: 0,
        kind: "video",
      }
    }

    return defaultDesktopImage ? { ...defaultDesktopImage, kind: "image" } : null
  }, [defaultDesktopImage, defaultVideoUrl])
  const [enabled, setEnabled] = useState(Boolean(defaultEnabled))
  const [media, setMedia] = useState<HeroMedia | null>(defaultMedia)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function uploadFile(file: File) {
    const previewUrl = URL.createObjectURL(file)
    const localMedia = createLocalMedia(file, previewUrl)

    setError("")
    setMedia(localMedia)

    if (isVideoFile(file)) {
      return
    }

    setUploading(true)

    try {
      const body = new FormData()
      body.set("folder", "bibajilbab/hero")
      body.append("files", file)

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body,
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        return
      }

      if (!isUploadResponse(payload) || !payload.uploads[0]) {
        return
      }

      const upload = payload.uploads[0]
      setMedia({
        id: upload.publicId,
        url: upload.secureUrl,
        cloudinaryPublicId: upload.publicId,
        alt: localMedia.alt,
        width: upload.width,
        height: upload.height,
        position: 0,
        kind: "image",
      })
    } catch {
      setMedia(localMedia)
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

  return (
    <section className="md:col-span-2">
      <input type="hidden" name="heroWasEnabled" value={defaultEnabled ? "on" : ""} />
      <input type="hidden" name="heroMediaJson" value={mediaJson(media)} />
      <div className="rounded-card border border-brand-border bg-brand-blush p-5">
        <label className="flex items-start gap-3 text-sm font-semibold text-brand-ink">
          <input
            name="heroEnabled"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="mt-1 h-5 w-5 rounded border-brand-border text-brand-plum"
          />
          <span>
            Afficher ce produit en bannière principale d'accueil
            <span className="mt-1 block text-sm font-normal leading-6 text-brand-muted">
              La bannière utilisera le nom du produit, sa description courte et les boutons
              standards de la boutique.
            </span>
          </span>
        </label>

        {enabled ? (
          <div className="mt-5 grid gap-4 rounded-card border border-brand-border bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-brand-ink">Média Hero</p>
              <p className="mt-1 text-xs text-brand-muted">
                Ajoutez une photo HD ou une vidéo courte MP4/WebM.
              </p>
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="rounded-card border border-dashed border-brand-powder bg-brand-blush p-5 text-center"
            >
              {media?.kind === "video" ? (
                <Video aria-hidden="true" className="mx-auto h-8 w-8 text-brand-plum" />
              ) : (
                <ImagePlus aria-hidden="true" className="mx-auto h-8 w-8 text-brand-plum" />
              )}
              <p className="mt-3 text-sm font-medium text-brand-ink">
                Glisser-déposer le média de bannière
              </p>
              <p className="mt-1 text-xs text-brand-muted">ou sélectionner un fichier</p>
              <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-card bg-brand-plum px-4 text-sm font-medium text-white transition hover:bg-brand-mauve focus-within:shadow-focus">
                <UploadCloud aria-hidden="true" className="h-4 w-4" />
                Choisir un média
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </label>
            </div>

            {uploading ? <p className="text-sm text-brand-muted">Téléversement...</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            {media ? (
              <div className="overflow-hidden rounded-card border border-brand-border">
                <div className="relative aspect-[16/9] bg-brand-blush">
                  {media.kind === "video" ? (
                    <video
                      src={media.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 720px"
                      unoptimized
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setMedia(null)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-plum shadow-soft transition hover:bg-brand-blush focus-visible:outline-none focus-visible:shadow-focus"
                    aria-label="Retirer le média"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
