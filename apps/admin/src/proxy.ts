import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { sessionCookieName } from "@/lib/session"

const publicPaths = new Set(["/login", "/reset-password", "/unauthorized"])
const publicPrefixes = [
  "/_next/",
  "/api/auth/mock-session",
  "/api/auth/session",
  "/api/auth/logout",
  "/favicon.ico",
  "/robots.txt",
]

function isPublicPath(pathname: string): boolean {
  return publicPaths.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSessionCookie = Boolean(request.cookies.get(sessionCookieName)?.value)

  if (!isPublicPath(pathname) && !hasSessionCookie) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("next", pathname)

    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === "/login" || pathname === "/reset-password") && hasSessionCookie) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    homeUrl.search = ""

    return NextResponse.redirect(homeUrl)
  }

  const response = NextResponse.next()
  response.headers.set("X-Robots-Tag", "noindex, nofollow")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
}
