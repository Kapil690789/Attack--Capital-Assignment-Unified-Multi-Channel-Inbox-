/**
 * Middleware for authentication and session management
 */
import { betterFetch } from "@better-fetch/fetch"
import { type NextRequest, NextResponse } from "next/server"
import type { Session } from "better-auth"

const publicRoutes = ["/auth/login", "/auth/signup", "/auth/callback"]

export default async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname

  // Skip middleware for public routes and API routes
  if (publicRoutes.includes(pathName) || pathName.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check session
  const session = await betterFetch<Session>(`${request.nextUrl.origin}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  })

  // Redirect to login if no session
  if (!session.data) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
