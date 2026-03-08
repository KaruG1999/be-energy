import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAuth, requireAdmin, isSession } from "@/lib/auth/middleware"
import { validateBody } from "@/lib/validation/validate"
import { createMeterSchema } from "@/lib/validation/schemas"
import { safeDbError, safeCatchError } from "@/lib/errors/safe-error"

// GET: authenticated, scoped to caller's cooperatives
export async function GET(req: NextRequest) {
  const session = await requireAuth()
  if (!isSession(session)) return session

  const { searchParams } = new URL(req.url)
  const cooperativeId = searchParams.get("cooperative_id")
  const status = searchParams.get("status")

  let query = supabase
    .from("meters")
    .select("*")
    .order("created_at", { ascending: false })

  if (cooperativeId) {
    if (!session.cooperative_ids.includes(cooperativeId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    query = query.eq("cooperative_id", cooperativeId)
  } else {
    if (session.cooperative_ids.length > 0) {
      query = query.in("cooperative_id", session.cooperative_ids)
    } else {
      return NextResponse.json([])
    }
  }

  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return safeDbError(error)

  return NextResponse.json(data)
}

// POST: admin — creates meter for cooperative
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const v = validateBody(createMeterSchema, body)
    if (!v.success) return v.response

    const session = await requireAdmin(v.data.cooperative_id)
    if (!isSession(session)) return session

    // Ensure prosumer exists for this member address
    const { data: existingProsumer } = await supabase
      .from("prosumers")
      .select("id")
      .eq("stellar_address", v.data.member_stellar_address)
      .single()

    if (!existingProsumer) {
      await supabase
        .from("prosumers")
        .insert({
          stellar_address: v.data.member_stellar_address,
          cooperative_id: v.data.cooperative_id,
          role: "prosumer",
        })
    }

    const { data, error } = await supabase
      .from("meters")
      .insert({
        cooperative_id: v.data.cooperative_id,
        member_stellar_address: v.data.member_stellar_address,
        device_type: v.data.device_type,
        technology: v.data.technology,
        capacity_kw: v.data.capacity_kw,
        manufacturer: v.data.manufacturer ?? null,
        model: v.data.model ?? null,
        serial_number: v.data.serial_number ?? null,
        location_lat: v.data.location_lat ?? null,
        location_lng: v.data.location_lng ?? null,
        installed_at: v.data.installed_at ?? null,
      })
      .select()
      .single()

    if (error) return safeDbError(error)

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return safeCatchError(err)
  }
}
