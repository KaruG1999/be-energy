import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const { mockSingle, mockOrder, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockOrder = vi.fn(() => ({ data: [], error: null }))
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockFrom = vi.fn(() => ({
    select: vi.fn((cols?: string) => {
      if (cols === "*") return { order: mockOrder }
      return { eq: mockEq }
    }),
    insert: mockInsert,
  }))
  return { mockSingle, mockOrder, mockFrom }
})

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}))

import { POST, GET } from "@/app/api/prosumers/route"

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/prosumers", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/prosumers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rechaza prosumidor sin stellar_address → 400", async () => {
    const res = await POST(makeRequest({ name: "Test" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Missing required field/)
  })

  it("rechaza stellar_address duplicada → 409", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "existing" }, error: null })

    const res = await POST(makeRequest({ stellar_address: "GABC" }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/already exists/)
  })

  it("crea prosumidor válido → 201", async () => {
    const fakeProsumer = {
      id: "uuid-1",
      stellar_address: "GABC",
      name: "Test",
      panel_capacity_kw: 3.5,
    }
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } })
    mockSingle.mockResolvedValueOnce({ data: fakeProsumer, error: null })

    const res = await POST(
      makeRequest({ stellar_address: "GABC", name: "Test", panel_capacity_kw: 3.5 })
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.stellar_address).toBe("GABC")
  })
})

describe("GET /api/prosumers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("lista todos los prosumidores", async () => {
    const fakeProsumers = [
      { id: "1", stellar_address: "GA1", name: "A" },
      { id: "2", stellar_address: "GA2", name: "B" },
    ]
    mockOrder.mockReturnValueOnce({ data: fakeProsumers, error: null })

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(2)
  })
})
