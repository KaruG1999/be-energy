import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireMember, isSession } from "@/lib/auth/middleware"
import { safeCatchError } from "@/lib/errors/safe-error"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireMember(id)
    if (!isSession(session)) return session

    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)

    const { data, error } = await supabase
      .from("readings")
      .select("*, prosumers(name, stellar_address)")
      .eq("cooperative_id", id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    return safeCatchError(err)
  }
}
