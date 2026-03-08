import { NextResponse } from "next/server"
import { getSession, setSessionCookie } from "@/lib/auth/session"
import { resolveRoles } from "@/lib/auth/roles"
import { signJWT } from "@/lib/auth/jwt"

export async function POST() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const roles = await resolveRoles(session.sub)

  const token = await signJWT({
    sub: session.sub,
    cooperative_ids: roles.cooperative_ids,
    admin_cooperative_ids: roles.admin_cooperative_ids,
    is_super_admin: session.is_super_admin,
  })

  const body = {
    stellar_address: session.sub,
    cooperative_ids: roles.cooperative_ids,
    admin_cooperative_ids: roles.admin_cooperative_ids,
    is_super_admin: session.is_super_admin,
  }

  const response = NextResponse.json(body)
  return setSessionCookie(response, token)
}
