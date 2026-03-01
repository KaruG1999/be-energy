import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stellar_address, kwh_injected, kwh_consumed, reading_date } = body

    if (!stellar_address || kwh_injected == null || !reading_date) {
      return NextResponse.json(
        { error: "Missing required fields: stellar_address, kwh_injected, reading_date" },
        { status: 400 }
      )
    }

    if (kwh_injected <= 0 || kwh_injected >= 100) {
      return NextResponse.json(
        { error: "kwh_injected must be > 0 and < 100" },
        { status: 400 }
      )
    }

    // Validate prosumer exists
    const { data: prosumer, error: prosumerError } = await supabase
      .from("prosumers")
      .select("id")
      .eq("stellar_address", stellar_address)
      .single()

    if (prosumerError || !prosumer) {
      return NextResponse.json(
        { error: "Prosumer not found for this stellar_address" },
        { status: 404 }
      )
    }

    // Check for duplicate reading on the same date
    const { data: existing } = await supabase
      .from("readings")
      .select("id")
      .eq("prosumer_id", prosumer.id)
      .eq("reading_date", reading_date)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "A reading already exists for this prosumer on this date" },
        { status: 409 }
      )
    }

    // Insert reading
    const { data: reading, error: insertError } = await supabase
      .from("readings")
      .insert({
        prosumer_id: prosumer.id,
        kwh_injected,
        kwh_consumed: kwh_consumed ?? null,
        reading_date,
        source: "manual",
        status: "pending",
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(reading, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
