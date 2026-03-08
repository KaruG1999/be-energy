import { Keypair, StrKey, hash } from "@stellar/stellar-sdk"

const SIGN_MESSAGE_PREFIX = "Stellar Signed Message:\n"

/**
 * Reproduce Freighter's SEP-0053 message encoding.
 * Freighter signs: SHA-256("Stellar Signed Message:\n" + message)
 * See: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md
 * Source: https://github.com/stellar/freighter/blob/master/extension/src/helpers/stellar.ts
 */
function encodeSep53Message(message: string): Buffer {
  const messageBytes = Buffer.from(message, "utf8")
  const prefixBytes = Buffer.from(SIGN_MESSAGE_PREFIX, "utf8")
  const encodedMessage = Buffer.concat([prefixBytes, messageBytes])
  return hash(encodedMessage) as Buffer
}

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
    const messageHash = encodeSep53Message(challenge)
    const signatureBuffer = Buffer.from(signature, "base64")
    return keypair.verify(messageHash, signatureBuffer)
  } catch {
    return false
  }
}
