import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const ADDR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
const COOP_ID = "00000000-0000-0000-0000-000000000001"
const METER_ID = "00000000-0000-0000-0000-000000000004"

const { mockSingle, mockEq, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockEq: ReturnType<typeof vi.fn> = vi.fn(() => ({ single: mockSingle, eq: mockEq }))
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({ eq: mockEq })),
    insert: mockInsert,
  }))
  return { mockSingle, mockEq, mockFrom }
})

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}))

vi.mock("@/lib/auth/middleware", () => ({
  requireAuth: vi.fn(async () => ({
    sub: ADDR,
    cooperative_ids: [COOP_ID],
    admin_cooperative_ids: [COOP_ID],
  })),
  isSession: vi.fn(() => true),
}))

import { POST } from "@/app/api/readings/route"

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/readings", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/readings", () => {
  beforeEach(() => vi.clearAllMocks())

  it("rechaza lectura sin stellar_address ni meter_id → 400", async () => {
    const res = await POST(makeRequest({ kwh_generated: 5, reading_date: "2025-01-01" }))
    expect(res.status).toBe(400)
  })

  it("rechaza lectura con kwh_generated <= 0 → 400", async () => {
    const res = await POST(
      makeRequest({ stellar_address: ADDR, kwh_generated: 0, reading_date: "2025-01-01" })
    )
    expect(res.status).toBe(400)
  })

  it("rechaza lectura con kwh_generated >= 1000 → 400", async () => {
    const res = await POST(
      makeRequest({ stellar_address: ADDR, kwh_generated: 1000, reading_date: "2025-01-01" })
    )
    expect(res.status).toBe(400)
  })

  it("rechaza lectura de prosumidor que no existe → 404", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } })

    const res = await POST(
      makeRequest({ stellar_address: ADDR, kwh_generated: 5, reading_date: "2025-01-01" })
    )
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toMatch(/Prosumer not found/)
  })

  it("rechaza lectura duplicada → 409", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "uuid-1", cooperative_id: COOP_ID }, error: null })
    mockSingle.mockResolvedValueOnce({ data: { id: "existing-reading" }, error: null })

    const res = await POST(
      makeRequest({ stellar_address: ADDR, kwh_generated: 5, reading_date: "2025-01-01" })
    )
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/already exists/)
  })

  it("crea lectura válida → 201 con status pending", async () => {
    const fakeReading = {
      id: "reading-1",
      prosumer_id: "uuid-1",
      kwh_generated: 5,
      reading_date: "2025-01-01",
      status: "pending",
    }
    mockSingle.mockResolvedValueOnce({ data: { id: "uuid-1", cooperative_id: COOP_ID }, error: null })
    mockSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({ data: fakeReading, error: null })

    const res = await POST(
      makeRequest({ stellar_address: ADDR, kwh_generated: 5, reading_date: "2025-01-01" })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.status).toBe("pending")
    expect(json.id).toBe("reading-1")
  })
})
