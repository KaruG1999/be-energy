import { NextResponse } from "next/server"

interface PostgrestError {
  code?: string
  message?: string
  details?: string
}

/** Map known Postgres error codes to safe client messages */
export function safeDbError(error: PostgrestError): NextResponse {
  const code = error.code

  if (code === "23505") {
    return NextResponse.json({ error: "Resource already exists" }, { status: 409 })
  }

  if (code === "23503") {
    return NextResponse.json({ error: "Referenced resource not found" }, { status: 400 })
  }

  // Log full error server-side only
  console.error("[DB Error]", { code, message: error.message, details: error.details })

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

/** Safe wrapper for unexpected errors in route handlers */
export function safeCatchError(error: unknown): NextResponse {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  console.error("[Unhandled Error]", error instanceof Error ? error.message : error)

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
