export const PRODUCT_NAME = "GF-777ACE"
export const KERNEL_VERSION = "GF-777ACE-Quantum-v3.0"
export const DEFAULT_SUCCESS_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/success`
  : "http://localhost:3000/success"
export const DEFAULT_CANCEL_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/cancel`
  : "http://localhost:3000/cancel"

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "",
}

export const RATE_LIMITS = {
  api: { windowMs: 60_000, max: 120 },
}

export const SECURITY = {
  webhookToleranceSeconds: 300,
}
