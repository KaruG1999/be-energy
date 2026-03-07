import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const ADDR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
const COOP_ID = "00000000-0000-0000-0000-000000000001"

const { mockSingle, mockOrder, mockIn, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockIn = vi.fn(() => ({ data: [], error: null }))
  const mockOrder = vi.fn(() => ({ data: [], error: null, in: mockIn }))
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockNot = vi.fn(() => ({ data: [], error: null }))
  const mockFrom = vi.fn(() => ({
    select: vi.fn((cols?: string) => {
      if (cols === "*") return { order: mockOrder, not: mockNot }
      return { eq: mockEq }
    }),
    insert: mockInsert,
  }))
  return { mockSingle, mockOrder, mockIn, mockFrom }
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
  requireAdmin: vi.fn(async () => ({
    sub: ADDR,
    cooperative_ids: [COOP_ID],
    admin_cooperative_ids: [COOP_ID],
  })),
  isSession: vi.fn(() => true),
}))

import { POST, GET } from "@/app/api/prosumers/route"

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/prosumers", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/prosumers", () => {
  beforeEach(() => vi.clearAllMocks())

  it("rechaza sin campos requeridos → 400", async () => {
    const res = await POST(makeRequest({ name: "Test" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Validation failed/)
  })

  it("crea prosumidor válido → 201", async () => {
    const fakeProsumer = {
      id: "uuid-1",
      stellar_address: ADDR,
      name: "Test",
      panel_capacity_kw: 3.5,
    }
    mockSingle.mockResolvedValueOnce({ data: fakeProsumer, error: null })

    const res = await POST(
      makeRequest({ stellar_address: ADDR, cooperative_id: COOP_ID, name: "Test", panel_capacity_kw: 3.5 })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.stellar_address).toBe(ADDR)
  })
})

describe("GET /api/prosumers", () => {
  beforeEach(() => vi.clearAllMocks())

  it("lista prosumidores scoped a cooperativa", async () => {
    const fakeProsumers = [
      { id: "1", stellar_address: ADDR, name: "A" },
    ]
    mockIn.mockReturnValueOnce({ data: fakeProsumers, error: null })

    const res = await GET(new NextRequest("http://localhost/api/prosumers"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
  })
})
