"use client"

import type { ManusUser } from "./index"

export default function ProjectList({ user }: { user: ManusUser }) {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-slate-400">Projects for {user.organization}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        Project list coming soon. Hook to your data source or Supabase projects table when available.
      </div>
    </div>
  )
}
