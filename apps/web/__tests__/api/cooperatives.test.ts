import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const ADDR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

const { mockSingle, mockOrder, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockOrder = vi.fn(() => ({ data: [], error: null }))
  const mockEq: ReturnType<typeof vi.fn> = vi.fn(() => ({ order: mockOrder, eq: mockEq }))
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({ order: mockOrder, eq: mockEq })),
    insert: mockInsert,
  }))
  return { mockSingle, mockOrder, mockFrom }
})

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}))

vi.mock("@/lib/auth/middleware", () => ({
  requireAuth: vi.fn(async () => ({
    sub: ADDR,
    cooperative_ids: ["00000000-0000-0000-0000-000000000001"],
    admin_cooperative_ids: ["00000000-0000-0000-0000-000000000001"],
  })),
  requireAdmin: vi.fn(async () => ({
    sub: ADDR,
    cooperative_ids: ["00000000-0000-0000-0000-000000000001"],
    admin_cooperative_ids: ["00000000-0000-0000-0000-000000000001"],
  })),
  isSession: vi.fn(() => true),
}))

import { GET, POST } from "@/app/api/cooperatives/route"

function makeGet(params = "") {
  return new NextRequest(`http://localhost/api/cooperatives${params}`)
}

function makePost(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/cooperatives", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("GET /api/cooperatives", () => {
  beforeEach(() => vi.clearAllMocks())

  it("lista cooperativas", async () => {
    const fakeCoops = [{ id: "1", name: "Coop Solar", technology: "solar" }]
    mockOrder.mockReturnValueOnce({ data: fakeCoops, error: null })

    const res = await GET(makeGet())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].name).toBe("Coop Solar")
  })
})

describe("POST /api/cooperatives", () => {
  beforeEach(() => vi.clearAllMocks())

  it("rechaza sin campos requeridos → 400", async () => {
    const res = await POST(makePost({ name: "Test" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Validation failed/)
  })

  it("rechaza technology inválida → 400", async () => {
    const res = await POST(
      makePost({ name: "Test", technology: "nuclear", admin_stellar_address: ADDR })
    )
    expect(res.status).toBe(400)
  })

  it("crea cooperativa válida → 201", async () => {
    const fakeCoop = { id: "uuid-1", name: "Coop Solar", technology: "solar" }
    mockSingle.mockResolvedValueOnce({ data: fakeCoop, error: null })

    const res = await POST(
      makePost({ name: "Coop Solar", technology: "solar", admin_stellar_address: ADDR })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.name).toBe("Coop Solar")
  })
})
