import { createHmac, randomBytes, timingSafeEqual } from "crypto"

export function hashSecret(secret: string) {
  return createHmac("sha256", process.env.SECRET_SALT || "gf-777ace").update(secret).digest("hex")
}

export function generateHmac(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

export function safeEqual(a: string, b: string) {
  const buffA = Buffer.from(a)
  const buffB = Buffer.from(b)
  if (buffA.length !== buffB.length) return false
  return timingSafeEqual(buffA, buffB)
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex")
}
