import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const ADDR = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
const BUYER = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
const COOP_ID = "00000000-0000-0000-0000-000000000001"
const CERT_ID = "00000000-0000-0000-0000-000000000002"

const { mockSingle, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockEq: ReturnType<typeof vi.fn> = vi.fn(() => ({ single: mockSingle, eq: mockEq }))
  const mockUpdate = vi.fn(() => ({ eq: mockEq }))
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({ eq: mockEq })),
    update: mockUpdate,
    insert: mockInsert,
  }))
  return { mockSingle, mockFrom }
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

vi.mock("@stellar/stellar-sdk", () => ({
  rpc: { Server: vi.fn() },
  Keypair: { fromSecret: vi.fn() },
  Contract: vi.fn(),
  TransactionBuilder: vi.fn(),
  nativeToScVal: vi.fn(),
}))

vi.mock("@/lib/contracts-config", () => ({
  CONTRACTS: { ENERGY_TOKEN: "CFAKECONTRACT" },
  STELLAR_CONFIG: { RPC_URL: "https://fake-rpc.stellar.org" },
  NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
}))

import { POST } from "@/app/api/certificates/retire/route"

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/certificates/retire", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("POST /api/certificates/retire", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
  })

  it("rechaza sin campos requeridos → 400", async () => {
    const res = await POST(makeRequest({ certificate_id: CERT_ID }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Validation failed/)
  })

  it("rechaza buyer_purpose inválido → 400", async () => {
    const res = await POST(
      makeRequest({
        certificate_id: CERT_ID,
        buyer_address: BUYER,
        buyer_purpose: "fun",
      })
    )
    expect(res.status).toBe(400)
  })

  it("rechaza certificado inexistente → 404", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "not found" } })

    const res = await POST(
      makeRequest({
        certificate_id: CERT_ID,
        buyer_address: BUYER,
        buyer_purpose: "esg_reporting",
      })
    )
    expect(res.status).toBe(404)
  })

  it("rechaza certificado con status != available → 400", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: CERT_ID, status: "pending", total_kwh: 100 },
      error: null,
    })

    const res = await POST(
      makeRequest({
        certificate_id: CERT_ID,
        buyer_address: BUYER,
        buyer_purpose: "esg_reporting",
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/pending/)
  })

  it("rechaza sin MINTER_SECRET_KEY → 500", async () => {
    delete process.env.MINTER_SECRET_KEY

    mockSingle.mockResolvedValueOnce({
      data: { id: CERT_ID, status: "available", total_kwh: 100 },
      error: null,
    })

    const res = await POST(
      makeRequest({
        certificate_id: CERT_ID,
        buyer_address: BUYER,
        buyer_purpose: "esg_reporting",
      })
    )
    expect(res.status).toBe(500)
  })
})
