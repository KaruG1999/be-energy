import { Keypair, StrKey } from "@stellar/stellar-sdk"

export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address)
  } catch {
    return false
  }
}

export function verifySignature(
  stellarAddress: string,
  challenge: string,
  signature: string
): boolean {
  try {
    const keypair = Keypair.fromPublicKey(stellarAddress)
    const messageBuffer = Buffer.from(challenge, "utf-8")
    const signatureBuffer = Buffer.from(signature, "base64")
    return keypair.verify(messageBuffer, signatureBuffer)
  } catch {
    return false
  }
}
