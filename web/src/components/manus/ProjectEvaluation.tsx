"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { AlertTriangle, CheckCircle2, ShieldCheck, Target, Zap } from "lucide-react"
import type { AceInput, AceScoreResult } from "../../types/ace"

type FormState = {
  project_name: string
  sector: "" | AceInput["sector"]
  budget: string
  duration_months: string
  beneficiaries: string
  esg_score: string
  risk_index: string
  execution_capacity: string
  scalability: string
  strategic_value: string
  compliance_score: string
  expected_roi: string
  apiKey: string
}

type ApiErrorBody = {
  ok?: false
  error?: {
    code?: string
    message?: string
    detail?: string
  }
}

type AceApiEnvelope =
  | {
      ok: true
      data: AceScoreResult
    }
  | ApiErrorBody

const initialForm: FormState = {
  project_name: "",
  sector: "",
  budget: "",
  duration_months: "",
  beneficiaries: "",
  esg_score: "",
  risk_index: "",
  execution_capacity: "",
  scalability: "",
  strategic_value: "",
  compliance_score: "",
  expected_roi: "",
  apiKey: "",
}

const scoreFields = [
  {
    name: "esg_score",
    label: "ESG score",
    help: "Your documented assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
  {
    name: "risk_index",
    label: "Risk index",
    help: "Your documented risk assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
  {
    name: "execution_capacity",
    label: "Execution capacity",
    help: "Your documented delivery-capacity assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
  {
    name: "scalability",
    label: "Scalability",
    help: "Your documented scalability assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
  {
    name: "strategic_value",
    label: "Strategic value",
    help: "Your documented strategic-value assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
  {
    name: "compliance_score",
    label: "Compliance score",
    help: "Your documented compliance assessment, from 0 to 100.",
    min: 0,
    max: 100,
  },
] as const

function parseFiniteNumber(
  raw: string,
  label: string,
  options: { min?: number; max?: number } = {}
): number {
  if (raw.trim() === "") {
    throw new Error(`${label} is required.`)
  }

  const value = Number(raw)
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`)
  }

  if (options.min !== undefined && value < options.min) {
    throw new Error(`${label} must be at least ${options.min}.`)
  }

  if (options.max !== undefined && value > options.max) {
    throw new Error(`${label} must be at most ${options.max}.`)
  }

  return value
}

function createPayload(form: FormState): AceInput {
  if (!form.project_name.trim()) {
    throw new Error("Project name is required.")
  }

  if (!form.sector) {
    throw new Error("Sector is required.")
  }

  return {
    project_name: form.project_name.trim(),
    sector: form.sector,
    budget: parseFiniteNumber(form.budget, "Budget", { min: 0 }),
    duration_months: parseFiniteNumber(form.duration_months, "Duration", { min: 1, max: 120 }),
    beneficiaries: parseFiniteNumber(form.beneficiaries, "Beneficiaries", { min: 0 }),
    esg_score: parseFiniteNumber(form.esg_score, "ESG score", { min: 0, max: 100 }),
    risk_index: parseFiniteNumber(form.risk_index, "Risk index", { min: 0, max: 100 }),
    execution_capacity: parseFiniteNumber(form.execution_capacity, "Execution capacity", {
      min: 0,
      max: 100,
    }),
    scalability: parseFiniteNumber(form.scalability, "Scalability", { min: 0, max: 100 }),
    strategic_value: parseFiniteNumber(form.strategic_value, "Strategic value", {
      min: 0,
      max: 100,
    }),
    compliance_score: parseFiniteNumber(form.compliance_score, "Compliance score", {
      min: 0,
      max: 100,
    }),
    expected_roi: parseFiniteNumber(form.expected_roi, "Expected ROI"),
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback

  const candidate = body as ApiErrorBody
  return candidate.error?.message || candidate.error?.detail || fallback
}

function isAceScoreResult(value: unknown): value is AceScoreResult {
  if (!value || typeof value !== "object") return false

  const result = value as Partial<AceScoreResult>
  const validTier = result.tier === "AAA" || result.tier === "A" || result.tier === "B" || result.tier === "C"
  const validBand =
    result.readiness_band === "HIGH_ALIGNMENT" ||
    result.readiness_band === "MODERATE_ALIGNMENT" ||
    result.readiness_band === "DEVELOPING_ALIGNMENT" ||
    result.readiness_band === "LOW_ALIGNMENT"

  return (
    result.contract_version === "2.0" &&
    typeof result.ace_score === "number" &&
    Number.isFinite(result.ace_score) &&
    validTier &&
    validBand &&
    result.decision === "REVIEW_REQUIRED" &&
    result.human_review_required === true &&
    result.assessment_basis === "INTERNAL_HEURISTIC" &&
    typeof result.context_provenance === "string" &&
    typeof result.kernel === "string" &&
    typeof result.rationale === "string" &&
    Array.isArray(result.limitations) &&
    result.limitations.every((item) => typeof item === "string")
  )
}

function formatBand(value: AceScoreResult["readiness_band"]) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function ProjectEvaluation() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AceScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const apiKey = form.apiKey.trim()
      if (!apiKey) {
        throw new Error("API key is required. It is kept only in this browser session.")
      }

      const payload = createPayload(form)
      const response = await fetch("/api/ace/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as AceApiEnvelope

      if (!response.ok || body.ok !== true) {
        throw new Error(errorMessage(body, "Readiness screening failed."))
      }

      if (!isAceScoreResult(body.data)) {
        throw new Error("The ACE API returned an unsupported response contract.")
      }

      setResult(body.data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Internal readiness screening</h1>
            <p className="text-slate-400">
              Owner-defined heuristic assessment. Qualified human review is always required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
          >
            New screening
          </button>
        </div>

        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">Not an approval or funding probability</div>
              <p className="mt-1 text-sm text-amber-100/90">
                This result is not a government or funder eligibility, approval, award, win-probability,
                or funding decision.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 lg:col-span-2">
            <div className="text-sm uppercase tracking-wide text-slate-400">Internal alignment score</div>
            <div className="mt-2 text-6xl font-bold text-cyan-400">{result.ace_score}</div>
            <div className="mt-3 text-sm text-slate-400">
              Internal tier {result.tier} · {formatBand(result.readiness_band)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
            <div className="mt-4 text-sm uppercase tracking-wide text-slate-400">Workflow status</div>
            <div className="mt-2 font-semibold text-white">Human review required</div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <Target className="h-7 w-7 text-blue-400" />
            <div className="mt-4 text-sm uppercase tracking-wide text-slate-400">Evidence basis</div>
            <div className="mt-2 font-semibold text-white">Internal heuristic</div>
            <div className="mt-1 text-xs text-slate-400">{result.context_provenance}</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
            <div>
              <h2 className="font-semibold text-white">Methodology statement</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{result.rationale}</p>
              <div className="mt-3 text-xs text-slate-500">
                Contract {result.contract_version} · Kernel {result.kernel}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="font-semibold text-white">Limitations</h2>
          <ul className="mt-3 space-y-2">
            {result.limitations.map((limitation) => (
              <li key={limitation} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 text-amber-400">•</span>
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Internal readiness screening</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Enter every scoring input directly. The system no longer invents missing project facts or
          converts a heuristic score into a funding probability.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-100">
        This screening is an internal decision-support tool. It does not determine eligibility,
        approval, award, or likelihood of funding.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Project inputs</h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="project_name" className="mb-2 block text-sm font-medium text-slate-300">
                Project name
              </label>
              <input
                id="project_name"
                name="project_name"
                value={form.project_name}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="sector" className="mb-2 block text-sm font-medium text-slate-300">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                value={form.sector}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select sector</option>
                <option value="gov">Government</option>
                <option value="health">Health</option>
                <option value="bank">Banking</option>
                <option value="fund">Fund / philanthropy</option>
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="mb-2 block text-sm font-medium text-slate-300">
                Budget (USD)
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="duration_months" className="mb-2 block text-sm font-medium text-slate-300">
                Duration (months)
              </label>
              <input
                id="duration_months"
                name="duration_months"
                type="number"
                min="1"
                max="120"
                value={form.duration_months}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="beneficiaries" className="mb-2 block text-sm font-medium text-slate-300">
                Beneficiaries
              </label>
              <input
                id="beneficiaries"
                name="beneficiaries"
                type="number"
                min="0"
                step="1"
                value={form.beneficiaries}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {scoreFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step="0.01"
                  value={form[field.name]}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">{field.help}</p>
              </div>
            ))}

            <div>
              <label htmlFor="expected_roi" className="mb-2 block text-sm font-medium text-slate-300">
                Expected ROI (%) — your estimate
              </label>
              <input
                id="expected_roi"
                name="expected_roi"
                type="number"
                step="0.01"
                value={form.expected_roi}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="mb-2 block text-sm font-medium text-slate-300">
                API key
              </label>
              <input
                id="apiKey"
                name="apiKey"
                type="password"
                autoComplete="off"
                value={form.apiKey}
                onChange={handleInputChange}
                required
                placeholder="gf_key_…"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                The key is kept in component memory and is not loaded from a public environment variable.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Zap className="h-5 w-5 animate-pulse" /> : <ShieldCheck className="h-5 w-5" />}
            <span>{loading ? "Running internal screening…" : "Run internal screening"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
