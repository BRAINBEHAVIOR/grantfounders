"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"

const categories = [
  { name: "Technical Merit", score: 82, color: "#10b981" },
  { name: "Broader Impact", score: 71, color: "#3b82f6" },
  { name: "Feasibility", score: 88, color: "#10b981" },
  { name: "Innovation", score: 65, color: "#f59e0b" },
  { name: "Team Strength", score: 79, color: "#10b981" },
  { name: "Commercialization", score: 58, color: "#ef4444" },
]

const risks = [
  { category: "Commercialization Plan", level: "High", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", desc: "Missing market size data and go-to-market timeline" },
  { category: "Innovation Clarity", level: "Medium", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", desc: "Technical novelty not clearly differentiated from prior work" },
  { category: "Budget Justification", level: "Medium", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", desc: "Personnel costs lack detailed role descriptions" },
  { category: "Broader Impact", level: "Low", color: "text-[#10b981]", bg: "bg-[#10b981]/10", desc: "Societal benefits could be more specific to underserved communities" },
]

const actions = [
  { priority: "P0", task: "Add TAM/SAM/SOM market analysis to commercialization section", impact: "+8 pts", locked: false },
  { priority: "P0", task: "Include go-to-market timeline with milestones", impact: "+5 pts", locked: false },
  { priority: "P1", task: "Add comparison table vs. existing solutions (prior art)", impact: "+4 pts", locked: false },
  { priority: "P1", task: "Detail team roles with hourly breakdowns in budget", impact: "+3 pts", locked: false },
  { priority: "P1", task: "Add letters of support from potential customers", impact: "+3 pts", locked: true },
  { priority: "P2", task: "Include diversity & inclusion hiring plan", impact: "+2 pts", locked: true },
  { priority: "P2", task: "Add data management plan with FAIR principles", impact: "+2 pts", locked: true },
]

const analysisSteps = [
  "Initializing GF-777ACE Kernel...",
  "Parsing proposal structure...",
  "Evaluating technical merit (47 dimensions)...",
  "Running agency DNA matching...",
  "Analyzing competitive landscape...",
  "Generating risk matrix...",
  "Computing ACE Score...",
  "Building action plan...",
]

export default function DashboardPage() {
  const [analyzing, setAnalyzing] = useState(true)
  const [step, setStep] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [done, setDone] = useState<Record<number, boolean>>({})

  const finishAnalysis = useCallback(() => setAnalyzing(false), [])

  useEffect(() => {
    if (!analyzing) return
    if (step < analysisSteps.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 550)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(finishAnalysis, 400)
      return () => clearTimeout(t)
    }
  }, [analyzing, step, finishAnalysis])

  /* ─── Analyzing Overlay ─── */
  if (analyzing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-full max-w-md px-6 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#10b981]/10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#10b981] border-t-transparent" />
          </div>
          <h2 className="text-xl font-bold text-[#fafafa]">Analyzing Your Proposal</h2>
          <p className="mt-2 text-sm text-[#a1a1aa]">GF-777ACE Kernel v3.2.1</p>
          <div className="mt-8 space-y-1 text-left">
            {analysisSteps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all ${
                  i < step ? "text-[#10b981]" : i === step ? "text-[#fafafa] bg-[#141414]" : "text-[#a1a1aa]/40"
                }`}
              >
                {i < step ? (
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : i === step ? (
                  <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#10b981] border-t-transparent" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border border-[#a1a1aa]/20" />
                )}
                {s}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#171717]">
              <div className="h-full rounded-full bg-[#10b981] transition-all duration-500" style={{ width: `${(step / analysisSteps.length) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#a1a1aa]">{Math.round((step / analysisSteps.length) * 100)}% complete</p>
          </div>
        </div>
      </div>
    )
  }

  const aceScore = 77

  /* ─── Dashboard ─── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#27272a] bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]">
                <span className="text-sm font-bold text-[#022c22]">GF</span>
              </div>
              <span className="hidden text-lg font-bold sm:inline">GrantFounders</span>
            </Link>
            <span className="rounded-full border border-[#27272a] bg-[#141414] px-3 py-0.5 text-xs text-[#a1a1aa]">Demo Mode</span>
          </div>
          <button onClick={() => setShowUpgrade(true)} className="rounded-lg bg-[#10b981] px-4 py-2 text-sm font-semibold text-[#022c22] hover:bg-[#10b981]/90">
            Upgrade to Pro
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proposal Analysis</h1>
            <p className="text-sm text-[#a1a1aa]">NSF SBIR Phase I — AI-Powered Climate Monitoring</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-medium text-[#10b981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Analyzed just now
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            {/* ACE Score */}
            <div className="rounded-2xl border border-[#27272a] bg-[#141414] p-8 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-[#a1a1aa]">Your ACE Score</p>
              <div className="relative mx-auto mt-6 h-48 w-48">
                <svg className="h-48 w-48 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#27272a" strokeWidth="10" />
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="534" strokeDashoffset={534 - (534 * aceScore) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-[#10b981]">{aceScore}</span>
                  <span className="text-xs text-[#a1a1aa]">out of 100</span>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-[#10b981]">Strong Candidate</p>
              <p className="mt-1 text-xs text-[#a1a1aa]">Top 23% of SBIR Phase I proposals</p>
              <div className="mt-6 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 p-3">
                <p className="text-xs text-[#a1a1aa]">Potential with fixes</p>
                <p className="text-lg font-bold text-[#10b981]">92 <span className="text-xs font-normal text-[#a1a1aa]">(+15 pts)</span></p>
              </div>
            </div>
            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#27272a] bg-[#141414] p-4 text-center">
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-[#a1a1aa]">Risks Found</p>
              </div>
              <div className="rounded-xl border border-[#27272a] bg-[#141414] p-4 text-center">
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-[#a1a1aa]">Actions Ready</p>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Category Breakdown */}
            <div className="rounded-2xl border border-[#27272a] bg-[#141414] p-6">
              <h2 className="text-lg font-bold">Category Breakdown</h2>
              <p className="text-sm text-[#a1a1aa]">Score across 6 federal review dimensions</p>
              <div className="mt-6 space-y-4">
                {categories.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="font-semibold" style={{ color: c.color }}>{c.score}/100</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#171717]">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${c.score}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Matrix */}
            <div className="rounded-2xl border border-[#27272a] bg-[#141414] p-6">
              <h2 className="text-lg font-bold">Risk Matrix</h2>
              <p className="text-sm text-[#a1a1aa]">Issues that reviewers will flag</p>
              <div className="mt-4 space-y-3">
                {risks.map((r) => (
                  <div key={r.category} className="flex items-start gap-4 rounded-xl border border-[#27272a] bg-[#0a0a0a]/50 p-4">
                    <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${r.bg} ${r.color}`}>{r.level}</span>
                    <div>
                      <p className="text-sm font-semibold">{r.category}</p>
                      <p className="mt-0.5 text-xs text-[#a1a1aa]">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Engine */}
            <div className="rounded-2xl border border-[#27272a] bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Action Engine</h2>
                  <p className="text-sm text-[#a1a1aa]">Prioritized fixes ranked by score impact</p>
                </div>
                <span className="rounded-full bg-[#10b981]/10 px-3 py-1 text-xs font-bold text-[#10b981]">+27 pts possible</span>
              </div>
              <div className="mt-4 space-y-2">
                {actions.map((a, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      a.locked
                        ? "border-[#27272a]/50 bg-[#171717]/30 opacity-50"
                        : done[i]
                        ? "border-[#10b981]/30 bg-[#10b981]/5"
                        : "border-[#27272a] bg-[#0a0a0a]/50"
                    }`}
                  >
                    {/* Checkbox / Lock */}
                    {a.locked ? (
                      <button onClick={() => setShowUpgrade(true)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#27272a] text-[#a1a1aa]">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          done[i] ? "border-[#10b981] bg-[#10b981]" : "border-[#27272a] hover:border-[#10b981]/50"
                        }`}
                      >
                        {done[i] && (
                          <svg className="h-3 w-3 text-[#022c22]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    )}
                    {/* Priority Badge */}
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                      a.priority === "P0" ? "bg-[#ef4444]/10 text-[#ef4444]" : a.priority === "P1" ? "bg-[#f59e0b]/10 text-[#f59e0b]" : "bg-[#171717] text-[#a1a1aa]"
                    }`}>{a.priority}</span>
                    {/* Task */}
                    <p className={`flex-1 text-sm ${done[i] ? "line-through text-[#a1a1aa]" : a.locked ? "text-[#a1a1aa]" : ""}`}>{a.task}</p>
                    {/* Impact */}
                    <span className="shrink-0 text-xs font-semibold text-[#10b981]">{a.impact}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowUpgrade(true)} className="mt-4 w-full rounded-lg border border-[#10b981]/30 bg-[#10b981]/5 py-3 text-sm font-semibold text-[#10b981] transition-colors hover:bg-[#10b981]/10">
                Unlock All Actions with Pro
              </button>
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-[#a1a1aa] underline underline-offset-4 hover:text-[#fafafa]">
            Back to GrantFounders.com
          </Link>
        </div>
      </main>

      {/* ── Upgrade Modal ── */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-4" onClick={() => setShowUpgrade(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-[#10b981]/30 bg-[#141414] p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#10b981]/10">
                <svg className="h-7 w-7 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold">Upgrade to Pro</h3>
              <p className="mt-2 text-sm text-[#a1a1aa]">Unlock the full power of the GF-777ACE engine</p>
              <div className="mt-6 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black">$99</span>
                <span className="text-[#a1a1aa]">/month</span>
              </div>
              <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm text-[#a1a1aa]">
                {["Unlimited proposal analyses", "Full action engine (all priorities)", "Agency DNA deep matching", "Competitive benchmarking", "Risk mitigation playbooks", "Priority email support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-lg bg-[#10b981] py-3 text-sm font-bold text-[#022c22] hover:bg-[#10b981]/90">
                Start Pro — 7-Day Free Trial
              </button>
              <button onClick={() => setShowUpgrade(false)} className="mt-3 text-xs text-[#a1a1aa] hover:text-[#fafafa]">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
