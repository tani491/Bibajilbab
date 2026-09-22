"use client"

const attributionStorageKey = "bibajilbab.attribution.v1"
const sessionStorageKey = "bibajilbab.analyticsSession.v1"

export type StorefrontEventName =
  | "page_view"
  | "product_view"
  | "cart_add"
  | "favorite_add"
  | "whatsapp_click"

export interface StorefrontAttribution {
  source: string
  referrer: string
  landingPath: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

function storage() {
  return typeof window === "undefined" ? undefined : window.localStorage
}

function classifySource(utmSource: string, referrer: string): string {
  const value = `${utmSource} ${referrer}`.toLowerCase()

  if (value.includes("tiktok")) return "TikTok"
  if (value.includes("instagram")) return "Instagram"
  if (value.includes("whatsapp") || value.includes("wa.me")) return "WhatsApp"
  if (value.includes("google")) return "Recherche Google"

  return referrer ? "Site référent" : "Accès direct"
}

function currentAttribution(): StorefrontAttribution {
  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get("utm_source")?.trim() || ""
  const utmMedium = params.get("utm_medium")?.trim() || ""
  const utmCampaign = params.get("utm_campaign")?.trim() || ""
  const referrer = document.referrer || ""
  const attribution: StorefrontAttribution = {
    source: classifySource(utmSource, referrer),
    referrer,
    landingPath: `${window.location.pathname}${window.location.search}`,
  }

  if (utmSource) {
    attribution.utmSource = utmSource
  }

  if (utmMedium) {
    attribution.utmMedium = utmMedium
  }

  if (utmCampaign) {
    attribution.utmCampaign = utmCampaign
  }

  return attribution
}

export function captureStorefrontAttribution(): StorefrontAttribution {
  const availableStorage = storage()
  const nextAttribution = currentAttribution()

  if (!availableStorage) {
    return nextAttribution
  }

  const hasCampaignSignal =
    Boolean(nextAttribution.utmSource) ||
    Boolean(nextAttribution.referrer) ||
    !availableStorage.getItem(attributionStorageKey)

  if (hasCampaignSignal) {
    availableStorage.setItem(attributionStorageKey, JSON.stringify(nextAttribution))

    return nextAttribution
  }

  return readStorefrontAttribution()
}

export function readStorefrontAttribution(): StorefrontAttribution {
  const availableStorage = storage()

  if (!availableStorage) {
    return currentAttribution()
  }

  const stored = availableStorage.getItem(attributionStorageKey)

  if (!stored) {
    return currentAttribution()
  }

  try {
    const parsed: unknown = JSON.parse(stored)

    if (!parsed || typeof parsed !== "object") {
      return currentAttribution()
    }

    const candidate = parsed as Record<string, unknown>

    return {
      source: typeof candidate.source === "string" ? candidate.source : "Accès direct",
      referrer: typeof candidate.referrer === "string" ? candidate.referrer : "",
      landingPath:
        typeof candidate.landingPath === "string"
          ? candidate.landingPath
          : window.location.pathname,
      ...(typeof candidate.utmSource === "string" ? { utmSource: candidate.utmSource } : {}),
      ...(typeof candidate.utmMedium === "string" ? { utmMedium: candidate.utmMedium } : {}),
      ...(typeof candidate.utmCampaign === "string"
        ? { utmCampaign: candidate.utmCampaign }
        : {}),
    }
  } catch {
    return currentAttribution()
  }
}

function getSessionId(): string {
  const availableStorage = storage()
  const existing = availableStorage?.getItem(sessionStorageKey)

  if (existing) {
    return existing
  }

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  availableStorage?.setItem(sessionStorageKey, next)

  return next
}

export function trackStorefrontEvent(
  name: StorefrontEventName,
  metadata: Record<string, unknown> = {},
  productId?: string,
) {
  if (typeof window === "undefined") {
    return
  }

  const attribution = readStorefrontAttribution()
  const payload = JSON.stringify({
    name,
    sessionId: getSessionId(),
    productId,
    metadata: {
      ...attribution,
      path: window.location.pathname,
      ...metadata,
    },
  })

  if ("sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" })

    if (navigator.sendBeacon("/api/analytics", blob)) {
      return
    }
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined)
}
