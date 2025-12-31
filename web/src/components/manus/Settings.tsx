"use client"

import type { ManusUser } from "./index"

export default function Settings({ user }: { user: ManusUser }) {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-slate-400">Manage preferences for {user.organization}.</p>
    </div>
  )
}
