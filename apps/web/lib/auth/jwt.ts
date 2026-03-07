import { SignJWT, jwtVerify } from "jose"

export interface JWTPayload {
  sub: string // stellar_address
  cooperative_ids: string[]
  admin_cooperative_ids: string[]
  iat: number
  exp: number
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not configured")
  return new TextEncoder().encode(secret)
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}
