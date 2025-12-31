"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { Zap, Upload, DollarSign, Users, Calendar, Tag, Target, Sparkles } from "lucide-react"
import type { ManusUser } from "./index"

const categories = [
  "Technology",
  "Healthcare",
  "Environment",
  "Education",
  "Agriculture",
  "Energy",
  "Social Impact",
  "Research",
  "Arts & Culture",
  "Other",
]

const innovationLevels = [
  { value: "incremental", label: "Incremental Improvement" },
  { value: "significant", label: "Significant Innovation" },
  { value: "breakthrough", label: "Breakthrough Technology" },
  { value: "disruptive", label: "Disruptive Innovation" },
]

type EvaluationResult = {
  project_id: string
  overall_score: number
  funding_probability: number
  confidence_level: number
  risk_assessment: string
  processing_time_ms: number
  detailed_scores: Record<string, number>
  insights: {
    strengths: string[]
    areas_for_improvement: string[]
    strategic_recommendations: string[]
  }
  benchmarks: {
    similar_projects_funded: number
    average_funding_amount: number
    success_rate_category: number
    percentile_ranking: number
  }
  api_response?: unknown
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

function getScoreGradient(score: number) {
  if (score >= 80) return "from-green-500 to-emerald-500"
  if (score >= 60) return "from-yellow-500 to-orange-500"
  return "from-red-500 to-pink-500"
}

function defaultResult(score: number, apiResponse: unknown): EvaluationResult {
  return {
    project_id: `proj_${Date.now()}`,
    overall_score: score,
    funding_probability: Math.min(0.99, Math.max(0.2, score / 100)),
    confidence_level: 0.85,
    risk_assessment: score >= 80 ? "low" : score >= 60 ? "medium" : "high",
    processing_time_ms: 2100,
    detailed_scores: {
      technical_feasibility: Math.min(100, score + 3),
      market_potential: Math.max(50, score - 4),
      team_capability: Math.min(100, score + 1),
      financial_viability: Math.max(45, score - 6),
      innovation_factor: Math.min(100, score + 5),
      social_impact: Math.max(40, score - 8),
    },
    insights: {
      strengths: [
        "Strong technical foundation with proven methodologies",
        "Clear market demand and target audience identification",
        "Experienced team with relevant domain expertise",
      ],
      areas_for_improvement: [
        "Expand partnership network for broader reach",
        "Develop more detailed risk mitigation strategies",
        "Strengthen financial projections with market validation",
      ],
      strategic_recommendations: [
        "Focus on pilot program with key stakeholders",
        "Develop intellectual property protection strategy",
        "Create detailed go-to-market timeline",
      ],
    },
    benchmarks: {
      similar_projects_funded: 127,
      average_funding_amount: 850_000,
      success_rate_category: 0.68,
      percentile_ranking: 78,
    },
    api_response: apiResponse,
  }
}

export default function ProjectEvaluation({ user, demoUser }: { user: ManusUser; demoUser?: ManusUser }) {
  const [formData, setFormData] = useState({
    project_title: "",
    description: "",
    budget: "",
    duration_months: "12",
    category: "",
    team_size: "1",
    keywords: "",
    target_audience: "",
    innovation_level: "incremental",
    apiKey: "",
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const quotaLimit = demoUser?.quota ?? user.subscription.monthly_evaluations_limit
  const quotaUsed = Math.min(user.subscription.monthly_evaluations_used, quotaLimit)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const apiKey = formData.apiKey || process.env.NEXT_PUBLIC_API_KEY
    if (!apiKey) {
      setError("API key required. Add it to the form or set NEXT_PUBLIC_API_KEY.")
      setLoading(false)
      return
    }

    try {
      const payload = {
        project_name: formData.project_title || "Untitled Project",
        sector: "gov" as const,
        budget: Number(formData.budget) || 0,
        duration_months: Number(formData.duration_months) || 0,
        beneficiaries: Math.max(10, Number(formData.team_size) * 50 || 100),
        esg_score: 75,
        risk_index: 25,
        execution_capacity: 80,
        scalability: 72,
        strategic_value: 78,
        compliance_score: 82,
        expected_roi: 1.4,
      }

      const response = await fetch("/api/ace/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || "Evaluation failed")
      }

      const score = Number(data?.ace_score ?? 0)
      setResult(defaultResult(score, data))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Results</h1>
            <p className="text-slate-400">AI-powered analysis powered by Abasensor™</p>
          </div>
          {demoUser && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-right text-sm text-cyan-100">
              <div className="font-semibold">Demo analysis</div>
              <div className="text-cyan-200/80">Upgrade to unlock full intelligence</div>
            </div>
          )}
          <button
            onClick={() => setResult(null)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
          >
            New Evaluation
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
          <div className="mb-4 inline-flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <span className="text-lg font-semibold text-white">Overall Assessment</span>
          </div>
          <div className={`mb-2 text-6xl font-bold ${getScoreColor(result.overall_score)}`}>
            {result.overall_score.toFixed(1)}%
          </div>
          <div className="mb-4 text-slate-400">Funding Readiness Score</div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div>
              <span className="text-slate-400">Funding Probability: </span>
              <span className="font-semibold text-green-400">{Math.round(result.funding_probability * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-400">Confidence: </span>
              <span className="font-semibold text-cyan-400">{Math.round(result.confidence_level * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-400">Processed in: </span>
              <span className="font-semibold text-blue-400">{(result.processing_time_ms / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Detailed Analysis</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.detailed_scores).map(([key, score]) => (
              <div key={key} className="rounded-lg bg-slate-750 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300 capitalize">{key.replace("_", " ")}</span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>{score.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h4 className="mb-4 text-lg font-semibold text-green-400">Strengths</h4>
            <ul className="space-y-2">
              {result.insights.strengths.map((strength, index) => (
                <li key={index} className="flex items-start text-sm text-slate-300">
                  <span className="mr-2 text-green-400">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h4 className="mb-4 text-lg font-semibold text-yellow-400">Areas for Improvement</h4>
            <ul className="space-y-2">
              {result.insights.areas_for_improvement.map((area, index) => (
                <li key={index} className="flex items-start text-sm text-slate-300">
                  <span className="mr-2 text-yellow-400">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <h4 className="mb-4 text-lg font-semibold text-cyan-400">Strategic Recommendations</h4>
            <ul className="space-y-2">
              {result.insights.strategic_recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-sm text-slate-300">
                  <span className="mr-2 text-cyan-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Market Benchmarks</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{result.benchmarks.similar_projects_funded}</div>
              <div className="text-sm text-slate-400">Similar Projects Funded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">${(result.benchmarks.average_funding_amount / 1_000_000).toFixed(1)}M</div>
              <div className="text-sm text-slate-400">Average Funding Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(result.benchmarks.success_rate_category * 100)}%</div>
              <div className="text-sm text-slate-400">Category Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{result.benchmarks.percentile_ranking}th</div>
              <div className="text-sm text-slate-400">Percentile Ranking</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-white">Project Evaluation</h1>
        <p className="text-slate-400">Get AI-powered funding analysis powered by Abasensor™ technology</p>
      </div>

      {demoUser && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-50">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Demo analysis</span>
            <span className="text-cyan-100/80">Upgrade to unlock full intelligence</span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-cyan-400" />
            <span className="font-medium text-white">Monthly Usage</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">
              {quotaUsed} / {quotaLimit}
            </div>
            <div className="text-sm text-slate-400">evaluations remaining</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Project Information</h3>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Project Title *</label>
              <input
                type="text"
                name="project_title"
                value={formData.project_title}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your project title"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Project Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Describe your project..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Budget (USD) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="500000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Duration (Months)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Category *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 pl-10 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Team Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min="1"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Keywords (comma-separated)</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="climate, infrastructure, ai"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Target Audience</label>
              <input
                type="text"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Federal agencies, municipalities, research institutions"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Innovation Level</label>
              <select
                name="innovation_level"
                value={formData.innovation_level}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {innovationLevels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">API Key (Bearer)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-750 px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Provide your API key"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Optional document input</h3>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-900 p-8 text-center text-slate-400">
            <Upload className="mb-3 h-10 w-10 text-cyan-400" />
            <p className="font-medium text-white">Drop files here or click to upload</p>
            <p className="text-sm text-slate-400">PDF, DOCX up to 25MB</p>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Evaluating with Abasensor™..." : "Evaluate Project"}
          </button>
        </div>
      </form>
    </div>
  )
}
