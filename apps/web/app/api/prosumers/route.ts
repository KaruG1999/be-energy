import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stellar_address, name, panel_capacity_kw } = body

    if (!stellar_address) {
      return NextResponse.json(
        { error: "Missing required field: stellar_address" },
        { status: 400 }
      )
    }

    // Check if address already exists
    const { data: existing } = await supabase
      .from("prosumers")
      .select("id")
      .eq("stellar_address", stellar_address)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "A prosumer with this stellar_address already exists" },
        { status: 409 }
      )
    }

    const { data: prosumer, error } = await supabase
      .from("prosumers")
      .insert({
        stellar_address,
        name: name ?? null,
        panel_capacity_kw: panel_capacity_kw ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(prosumer, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("prosumers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
