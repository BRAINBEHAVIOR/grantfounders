"use client"

import type { ManusUser } from "./index"

export default function Analytics({ user }: { user: ManusUser }) {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <p className="text-slate-400">Analytics dashboard coming soon for {user.organization}.</p>
    </div>
  )
}
