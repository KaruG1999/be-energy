import { NextResponse } from "next/server"
import type { ZodSchema, ZodError } from "zod"

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): ValidationResult<T> {
  const result = schema.safeParse(body)

  if (!result.success) {
    const errors = (result.error as ZodError).issues.map((i) => i.message)
    return {
      success: false,
      response: NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      ),
    }
  }

  return { success: true, data: result.data }
}
