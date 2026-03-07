import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Add request ID to all API requests
  if (req.nextUrl.pathname.startsWith("/api")) {
    const requestId = crypto.randomUUID()
    response.headers.set("X-Request-Id", requestId)
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}
