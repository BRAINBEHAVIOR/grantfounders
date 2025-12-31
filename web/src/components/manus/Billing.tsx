"use client"

import type { ManusUser } from "./index"

export default function Billing({ user }: { user: ManusUser }) {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Billing & Subscription</h1>
      <p className="text-slate-400">Billing management coming soon for {user.organization}.</p>
    </div>
  )
}
