const commonConnectSources = [
  "'self'",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://firestore.googleapis.com",
  "https://*.googleapis.com",
  "https://*.firebaseio.com",
  "https://api.cloudinary.com",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "ws://localhost:*",
  "ws://127.0.0.1:*",
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
      ]

  const scriptSources = ["'self'", "'unsafe-inline'"]

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'")
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
  ]

  if (options.admin) {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" })
  }

  return headers
}
