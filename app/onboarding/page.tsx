"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Step = "company" | "grant" | "proposal" | "team" | "review"
const STEPS: { key: Step; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "grant", label: "Grant Target" },
  { key: "proposal", label: "Proposal" },
  { key: "team", label: "Team" },
  { key: "review", label: "Review" },
]

const AGENCIES = ["NSF", "NIH", "DoD", "DOE", "NASA", "USDA"]
const STAGES = ["Pre-seed", "Seed", "Series A", "Series B+", "Bootstrapped"]
const TRLS = ["TRL 1-2 (Basic Research)", "TRL 3-4 (Proof of Concept)", "TRL 5-6 (Prototype)", "TRL 7-9 (Production Ready)"]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<Step>("company")
  const [data, setData] = useState({
    companyName: "", industry: "", stage: "", teamSize: "",
    agencies: [] as string[], fundingGoal: "", trl: "",
    title: "", abstract: "",
    founderBg: "", teamQual: "",
  })

  const idx = STEPS.findIndex((s) => s.key === current)
  const update = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }))
  const next = () => idx < STEPS.length - 1 && setCurrent(STEPS[idx + 1].key)
  const prev = () => idx > 0 && setCurrent(STEPS[idx - 1].key)

  const toggleAgency = (a: string) => {
    update({ agencies: data.agencies.includes(a) ? data.agencies.filter((x) => x !== a) : [...data.agencies, a] })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Header */}
      <header className="border-b border-[#27272a]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981]">
              <span className="text-sm font-bold text-[#022c22]">GF</span>
            </div>
            <span className="text-lg font-bold">GrantFounders</span>
          </Link>
          <span className="text-sm text-[#a1a1aa]">Step {idx + 1} of {STEPS.length}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-10 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i < idx ? "bg-[#10b981] text-[#022c22]" : i === idx ? "bg-[#10b981]/20 text-[#10b981] ring-2 ring-[#10b981]" : "bg-[#171717] text-[#a1a1aa]"
                }`}>
                  {i < idx ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded-full ${i < idx ? "bg-[#10b981]" : "bg-[#27272a]"}`} />}
              </div>
              <span className={`hidden text-xs sm:block ${i <= idx ? "text-[#fafafa]" : "text-[#a1a1aa]"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Step: Company ── */}
        {current === "company" && (
          <div>
            <h2 className="text-2xl font-bold">Tell us about your company</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">This helps our AI understand your profile and match you to the right grants.</p>
            <div className="mt-8 space-y-6">
              <Field label="Company Name" value={data.companyName} onChange={(v) => update({ companyName: v })} placeholder="e.g. Acme AI" />
              <Field label="Industry / Sector" value={data.industry} onChange={(v) => update({ industry: v })} placeholder="e.g. Clean Energy, Biotech, AI/ML" />
              <div>
                <label className="mb-2 block text-sm font-medium">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button key={s} onClick={() => update({ stage: s })} className={`rounded-lg border px-4 py-2 text-sm transition-colors ${data.stage === s ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]" : "border-[#27272a] bg-[#141414] text-[#a1a1aa] hover:border-[#10b981]/40"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <Field label="Team Size" value={data.teamSize} onChange={(v) => update({ teamSize: v })} placeholder="e.g. 5" type="number" />
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={next} disabled={!data.companyName} className="rounded-lg bg-[#10b981] px-8 py-3 text-sm font-semibold text-[#022c22] hover:bg-[#10b981]/90 disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}

        {/* ── Step: Grant Target ── */}
        {current === "grant" && (
          <div>
            <h2 className="text-2xl font-bold">What grants are you targeting?</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">Select agencies and funding details so we can run the right analysis.</p>
            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Target Agencies</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {AGENCIES.map((a) => (
                    <button key={a} onClick={() => toggleAgency(a)} className={`rounded-lg border py-3 text-sm font-semibold transition-colors ${data.agencies.includes(a) ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]" : "border-[#27272a] bg-[#141414] text-[#a1a1aa] hover:border-[#10b981]/40"}`}>{a}</button>
                  ))}
                </div>
              </div>
              <Field label="Funding Goal" value={data.fundingGoal} onChange={(v) => update({ fundingGoal: v })} placeholder="e.g. $250,000" />
              <div>
                <label className="mb-2 block text-sm font-medium">Technology Readiness Level</label>
                <div className="space-y-2">
                  {TRLS.map((t) => (
                    <button key={t} onClick={() => update({ trl: t })} className={`block w-full rounded-lg border p-3 text-left text-sm transition-colors ${data.trl === t ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]" : "border-[#27272a] bg-[#141414] text-[#a1a1aa] hover:border-[#10b981]/40"}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={prev} className="rounded-lg border border-[#27272a] px-6 py-3 text-sm text-[#a1a1aa] hover:bg-[#171717]">Back</button>
              <button onClick={next} disabled={data.agencies.length === 0} className="rounded-lg bg-[#10b981] px-8 py-3 text-sm font-semibold text-[#022c22] hover:bg-[#10b981]/90 disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}

        {/* ── Step: Proposal ── */}
        {current === "proposal" && (
          <div>
            <h2 className="text-2xl font-bold">Your proposal details</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">Paste your abstract or key sections. The more detail, the better our analysis.</p>
            <div className="mt-8 space-y-6">
              <Field label="Proposal Title" value={data.title} onChange={(v) => update({ title: v })} placeholder="e.g. AI-Powered Climate Monitoring System" />
              <div>
                <label className="mb-2 block text-sm font-medium">Abstract / Summary</label>
                <textarea
                  value={data.abstract}
                  onChange={(e) => update({ abstract: e.target.value })}
                  rows={8}
                  placeholder="Paste your proposal abstract here. Include your problem statement, technical approach, and expected outcomes..."
                  className="w-full rounded-lg border border-[#27272a] bg-[#141414] px-4 py-3 text-sm text-[#fafafa] placeholder-[#a1a1aa]/50 focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                />
                <p className="mt-1 text-xs text-[#a1a1aa]">{data.abstract.length} characters</p>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={prev} className="rounded-lg border border-[#27272a] px-6 py-3 text-sm text-[#a1a1aa] hover:bg-[#171717]">Back</button>
              <button onClick={next} disabled={!data.title} className="rounded-lg bg-[#10b981] px-8 py-3 text-sm font-semibold text-[#022c22] hover:bg-[#10b981]/90 disabled:opacity-40">Continue</button>
            </div>
          </div>
        )}

        {/* ── Step: Team ── */}
        {current === "team" && (
          <div>
            <h2 className="text-2xl font-bold">Team qualifications</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">Reviewers heavily weight team experience. Tell us what makes yours stand out.</p>
            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">PI / Founder Background</label>
                <textarea
                  value={data.founderBg}
                  onChange={(e) => update({ founderBg: e.target.value })}
                  rows={4}
                  placeholder="PhD in Computer Science from MIT, 10 years in climate tech..."
                  className="w-full rounded-lg border border-[#27272a] bg-[#141414] px-4 py-3 text-sm text-[#fafafa] placeholder-[#a1a1aa]/50 focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Key Team Qualifications</label>
                <textarea
                  value={data.teamQual}
                  onChange={(e) => update({ teamQual: e.target.value })}
                  rows={4}
                  placeholder="2 PhDs in relevant fields, 3 patents, prior NSF experience..."
                  className="w-full rounded-lg border border-[#27272a] bg-[#141414] px-4 py-3 text-sm text-[#fafafa] placeholder-[#a1a1aa]/50 focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                />
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={prev} className="rounded-lg border border-[#27272a] px-6 py-3 text-sm text-[#a1a1aa] hover:bg-[#171717]">Back</button>
              <button onClick={next} className="rounded-lg bg-[#10b981] px-8 py-3 text-sm font-semibold text-[#022c22] hover:bg-[#10b981]/90">Review</button>
            </div>
          </div>
        )}

        {/* ── Step: Review ── */}
        {current === "review" && (
          <div>
            <h2 className="text-2xl font-bold">Review & Analyze</h2>
            <p className="mt-2 text-sm text-[#a1a1aa]">Confirm your details, then let the GF-777ACE engine do its magic.</p>
            <div className="mt-8 space-y-4">
              <ReviewCard title="Company" items={[
                ["Name", data.companyName || "Not provided"],
                ["Industry", data.industry || "Not provided"],
                ["Stage", data.stage || "Not provided"],
                ["Team Size", data.teamSize || "Not provided"],
              ]} />
              <ReviewCard title="Grant Target" items={[
                ["Agencies", data.agencies.join(", ") || "Not selected"],
                ["Funding Goal", data.fundingGoal || "Not provided"],
                ["TRL", data.trl || "Not selected"],
              ]} />
              <ReviewCard title="Proposal" items={[
                ["Title", data.title || "Not provided"],
                ["Abstract", data.abstract ? `${data.abstract.substring(0, 100)}...` : "Not provided"],
              ]} />
              <ReviewCard title="Team" items={[
                ["PI Background", data.founderBg ? `${data.founderBg.substring(0, 100)}...` : "Not provided"],
                ["Qualifications", data.teamQual ? `${data.teamQual.substring(0, 100)}...` : "Not provided"],
              ]} />
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={prev} className="rounded-lg border border-[#27272a] px-6 py-3 text-sm text-[#a1a1aa] hover:bg-[#171717]">Back</button>
              <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 rounded-lg bg-[#10b981] px-8 py-3 text-sm font-bold text-[#022c22] hover:bg-[#10b981]/90">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Run ACE Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/* ─── Reusable Field ─── */
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#27272a] bg-[#141414] px-4 py-3 text-sm text-[#fafafa] placeholder-[#a1a1aa]/50 focus:border-[#10b981] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
      />
    </div>
  )
}

/* ─── Review Card ─── */
function ReviewCard({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#141414] p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#10b981]">{title}</h3>
      <dl className="space-y-2">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <dt className="text-[#a1a1aa]">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
