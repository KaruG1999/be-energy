import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAuth, isSession } from "@/lib/auth/middleware"
import { validateBody } from "@/lib/validation/validate"
import { createReadingSchema } from "@/lib/validation/schemas"
import { safeDbError, safeCatchError } from "@/lib/errors/safe-error"

// POST: authenticated — member or admin of the cooperative
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (!isSession(session)) return session

    const body = await req.json()
    const v = validateBody(createReadingSchema, body)
    if (!v.success) return v.response

    const { stellar_address, meter_id, kwh_generated, kwh_injected, kwh_self_consumed, kwh_consumed,
            reading_date, reading_timestamp, power_watts, interval_minutes, cooperative_id } = v.data

    const kwhGen = kwh_generated ?? kwh_injected
    const kwhSelf = kwh_self_consumed ?? kwh_consumed

    let prosumerId: string | null = null
    let coopId: string | null = cooperative_id ?? null

    if (stellar_address) {
      const { data: prosumer, error: prosumerError } = await supabase
        .from("prosumers")
        .select("id, cooperative_id")
        .eq("stellar_address", stellar_address)
        .single()

      if (prosumerError || !prosumer) {
        return NextResponse.json(
          { error: "Prosumer not found for this stellar_address" },
          { status: 404 }
        )
      }

      prosumerId = prosumer.id
      if (!coopId) coopId = prosumer.cooperative_id
    }

    if (meter_id) {
      const { data: meter } = await supabase
        .from("meters")
        .select("cooperative_id")
        .eq("id", meter_id)
        .single()

      if (meter && !coopId) coopId = meter.cooperative_id
    }

    // Authorization: must be member of the cooperative
    if (coopId && !session.cooperative_ids.includes(coopId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check for duplicate reading on the same date
    if (prosumerId && reading_date) {
      const { data: existing } = await supabase
        .from("readings")
        .select("id")
        .eq("prosumer_id", prosumerId)
        .eq("reading_date", reading_date)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: "A reading already exists for this prosumer on this date" },
          { status: 409 }
        )
      }
    }

    const { data: reading, error: insertError } = await supabase
      .from("readings")
      .insert({
        prosumer_id: prosumerId,
        meter_id: meter_id ?? null,
        cooperative_id: coopId,
        kwh_generated: kwhGen,
        kwh_self_consumed: kwhSelf ?? null,
        power_watts: power_watts ?? null,
        interval_minutes: interval_minutes ?? 15,
        reading_date: reading_date ?? null,
        reading_timestamp: reading_timestamp ?? null,
        source: meter_id ? "meter" : "manual",
        status: "pending",
      })
      .select()
      .single()

    if (insertError) return safeDbError(insertError)

    return NextResponse.json(reading, { status: 201 })
  } catch (err) {
    return safeCatchError(err)
  }
}
