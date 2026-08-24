const commonConnectSources = [
  "'self'",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://firestore.googleapis.com",
  "https://*.googleapis.com",
  "https://*.firebaseio.com",
  "https://api.cloudinary.com",
]

const preconnectSources = [
  { key: "Link", value: "<https://identitytoolkit.googleapis.com>; rel=preconnect; crossorigin" },
  { key: "Link", value: "<https://securetoken.googleapis.com>; rel=preconnect; crossorigin" },
  { key: "Link", value: "<https://firestore.googleapis.com>; rel=preconnect; crossorigin" },
  { key: "Link", value: "<https://res.cloudinary.com>; rel=preconnect; crossorigin" },
]

function contentSecurityPolicy({
  admin = false,
  isDevelopment = process.env.NODE_ENV === "development",
} = {}) {
  const connectSources = admin
    ? commonConnectSources
    : [
        ...commonConnectSources,
        "https://wa.me",
        "https://www.instagram.com",
        "https://www.tiktok.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ]

  if (isDevelopment) {
    connectSources.push(
      "http://localhost:*",
      "http://127.0.0.1:*",
      "ws://localhost:*",
      "ws://127.0.0.1:*",
    )
  }

  const scriptSources = ["'self'", "'unsafe-inline'"]

  // React/Next development tooling requires eval for stack reconstruction and HMR.
  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'")
  }

  if (!admin) {
    scriptSources.push("https://www.googletagmanager.com")
  }

  const directives = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["frame-ancestors", "'none'"],
    ["object-src", "'none'"],
    ["img-src", "'self'", "data:", "blob:", "https://res.cloudinary.com"],
    ["font-src", "'self'", "data:"],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["script-src", ...scriptSources],
    ["connect-src", ...connectSources],
    ["form-action", admin ? "'self'" : "'self' https://wa.me"],
    ["media-src", "'self'", "https://res.cloudinary.com"],
    ["worker-src", "'self'", "blob:"],
    ["manifest-src", "'self'"],
  ]

  return directives.map((directive) => directive.join(" ")).join("; ")
}

export function createSecurityHeaders(options = {}) {
  const headers = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(options) },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    // Add preconnect headers for performance on critical external domains
    ...preconnectSources,
  ]

  if (options.admin) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" })
  }

  return headers
}
