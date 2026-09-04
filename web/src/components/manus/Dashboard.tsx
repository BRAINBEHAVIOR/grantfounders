"use client"

import { useMemo } from "react"
import { AlertTriangle, FileText, ShieldCheck, Target } from "lucide-react"
import type { ManusUser } from "./index"

export default function Dashboard({ user }: { user: ManusUser }) {
  const welcomeName = useMemo(() => user.name.split(" ")[0] || "Founder", [user.name])
  const used = Math.max(0, user.subscription.monthly_evaluations_used)
  const limit = Math.max(0, user.subscription.monthly_evaluations_limit)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
        <h1 className="text-2xl font-bold text-white">Welcome, {welcomeName}</h1>
        <p className="mt-2 text-slate-300">
          This dashboard displays only account values supplied by the authenticated product context.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">Evidence-first mode</div>
            <p className="mt-1 text-sm text-amber-100/90">
              Funding probabilities, success rates, award totals, market benchmarks, opportunity matches,
              and customer outcomes remain hidden until a verified data source and provenance record exist.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <ShieldCheck className="h-7 w-7 text-cyan-400" />
          <div className="mt-4 text-sm uppercase tracking-wide text-slate-400">Plan</div>
          <div className="mt-2 text-xl font-semibold text-white">{user.subscription.plan}</div>
          <div className="mt-2 text-sm text-slate-400">
            Recorded usage: {used} / {limit}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <FileText className="h-7 w-7 text-blue-400" />
          <div className="mt-4 text-sm uppercase tracking-wide text-slate-400">Projects</div>
          <div className="mt-2 font-semibold text-white">No verified metrics connected</div>
          <p className="mt-2 text-sm text-slate-400">
            Project totals and trends will appear only from an authenticated system of record.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <Target className="h-7 w-7 text-green-400" />
          <div className="mt-4 text-sm uppercase tracking-wide text-slate-400">Opportunities</div>
          <div className="mt-2 font-semibold text-white">No verified feed connected</div>
          <p className="mt-2 text-sm text-slate-400">
            No fabricated opportunity, amount, deadline, match score, or probability is displayed.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h2 className="font-semibold text-white">Assessment policy</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          ACE results are internal heuristic readiness signals. Every result requires qualified human
          review and must not be described as government eligibility, approval, award, win probability,
          expected value, or a funding decision.
        </p>
        <div className="mt-4 text-xs text-slate-500">
          Organization: {user.organization || "Not provided"}
        </div>
      </div>
    </div>
  )
}
