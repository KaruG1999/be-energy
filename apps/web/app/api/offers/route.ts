import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("offers")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false})

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { seller_address, seller_short, amount_kwh, price_per_kwh, total_xlm } = body

        if (!seller_address || !amount_kwh || !price_per_kwh || !total_xlm) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400})
        }

        const { data, error } = await supabase
            .from("offers")
            .insert({
                seller_address,
                seller_short,
                amount_kwh,
                price_per_kwh,
                total_xlm,
                status: "active"
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Failes to create offer" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, status, tx_hash } = body

        const { data, error } = await supabase
            .from("offers")
            .update({ status, tx_hash })
            .eq("id" , id)
            .select()
            .single()
        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update offer"}, { status:500 })
    }
}

