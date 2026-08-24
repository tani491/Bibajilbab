import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Global middleware for admin app
 * Protects all routes except login and auth endpoints by checking for session cookie
 * Note: Full session verification happens server-side on protected pages
 */
export async function middleware(request: NextRequest) {
  // Allow login and auth routes without authentication
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/api/auth/") ||
    request.nextUrl.pathname === "/unauthorized"
  ) {
    return NextResponse.next()
  }

  // Check for session cookie (Edge-safe, no full verification needed here)
  const sessionCookie = request.cookies.get("__session")?.value

  // If no session cookie and trying to access protected route, redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session exists, allow the request through
  // Full verification will happen server-side in route handlers/page components
  return NextResponse.next()
}

/**
 * Configure which routes this middleware should run on
 * Protects all routes except login, auth APIs, and public error pages
 */
export const config = {
  matcher: [
    // Protect all routes
    "/((?!_next/static|_next/image|favicon.ico|login|unauthorized|api/auth).*)",
  ],
}
