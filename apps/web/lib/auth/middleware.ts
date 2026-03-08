import { NextResponse } from "next/server"
import { getSession } from "./session"
import type { JWTPayload } from "./jwt"

export type Session = JWTPayload

export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  return session
}

export async function requireAdmin(coopId: string): Promise<Session | NextResponse> {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  const session = result
  if (!session.admin_cooperative_ids.includes(coopId)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  return session
}

export async function requireMember(coopId: string): Promise<Session | NextResponse> {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  const session = result
  if (!session.cooperative_ids.includes(coopId)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }
  return session
}

export async function requireSuperAdmin(): Promise<Session | NextResponse> {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  const session = result
  if (!session.is_super_admin) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 })
  }
  return session
}

export async function optionalAuth(): Promise<Session | null> {
  return getSession()
}

/** Type guard: returns true if result is a session, false if it's an error response */
export function isSession(result: Session | NextResponse): result is Session {
  return !(result instanceof NextResponse)
}
