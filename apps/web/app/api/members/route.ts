import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAuth, isSession } from "@/lib/auth/middleware"
import { validateBody } from "@/lib/validation/validate"
import { createProsumerSchema } from "@/lib/validation/schemas"
import { safeDbError, safeCatchError } from "@/lib/errors/safe-error"

// GET: authenticated, scoped to caller's cooperatives
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!isSession(session)) return session

  const { searchParams } = new URL(req.url)
  const cooperativeId = searchParams.get("cooperative_id")

  let query = supabase
    .from("prosumers")
    .select("*")
    .order("created_at", { ascending: false })

  if (cooperativeId) {
    // Must be member of that cooperative
    if (!session.cooperative_ids.includes(cooperativeId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    query = query.eq("cooperative_id", cooperativeId)
  } else {
    // Scope to caller's cooperatives
    if (session.cooperative_ids.length > 0) {
      query = query.in("cooperative_id", session.cooperative_ids)
    } else {
      return NextResponse.json([])
    }
  }

  const { data, error } = await query
  if (error) return safeDbError(error)

  return NextResponse.json(data)
}

// POST: legacy endpoint — creates prosumer
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!isSession(session)) return session

    const body = await req.json()
    const v = validateBody(createProsumerSchema, body)
    if (!v.success) return v.response

    const { data, error } = await supabase
      .from("prosumers")
      .insert({
        stellar_address: v.data.stellar_address,
        name: v.data.name ?? null,
        panel_capacity_kw: v.data.panel_capacity_kw ?? null,
        cooperative_id: v.data.cooperative_id ?? null,
        role: v.data.role,
      })
      .select()
      .single()

    if (error) return safeDbError(error)

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return safeCatchError(err)
  }
}
