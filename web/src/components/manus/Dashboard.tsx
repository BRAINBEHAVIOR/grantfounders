"use client"

import { useMemo, useState } from "react"
import { TrendingUp, DollarSign, FileText, Zap, Target, Award, ChevronRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { ManusUser } from "./index"

const categoryData = [
  { name: "Technology", value: 35, color: "#06b6d4" },
  { name: "Healthcare", value: 25, color: "#3b82f6" },
  { name: "Environment", value: 20, color: "#10b981" },
  { name: "Education", value: 12, color: "#f59e0b" },
  { name: "Other", value: 8, color: "#8b5cf6" },
]

const scoreData = [
  { month: "Jul", score: 72 },
  { month: "Aug", score: 75 },
  { month: "Sep", score: 78 },
  { month: "Oct", score: 76 },
  { month: "Nov", score: 81 },
  { month: "Dec", score: 78.4 },
]

const opportunities = [
  { id: 1, title: "Climate Innovation Fund", funder: "Climate Foundation", amount: "$500K - $2M", deadline: "2024-03-15", match_score: 94 },
  { id: 2, title: "Healthcare Innovation Grant", funder: "National Health Foundation", amount: "$250K - $1.5M", deadline: "2024-04-01", match_score: 87 },
  { id: 3, title: "AI Research Initiative", funder: "Tech Innovation Council", amount: "$1M - $5M", deadline: "2024-02-28", match_score: 91 },
]

const defaultStats = { totalProjects: 47, avgScore: 78.4, successRate: 73, totalFunding: 12_400_000 }

const defaultRecentProjects = [
  {
    id: 1,
    title: "AI-Powered Climate Monitoring System",
    score: 87.3,
    status: "completed",
    funding_probability: 0.89,
    created_at: "2024-01-15",
    category: "Technology",
  },
  {
    id: 2,
    title: "Sustainable Agriculture Platform",
    score: 82.1,
    status: "completed",
    funding_probability: 0.84,
    created_at: "2024-01-14",
    category: "Agriculture",
  },
  {
    id: 3,
    title: "Healthcare Data Analytics Tool",
    score: 75.6,
    status: "processing",
    funding_probability: 0.76,
    created_at: "2024-01-13",
    category: "Healthcare",
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "text-green-400 bg-green-400/20"
    case "processing":
      return "text-yellow-400 bg-yellow-400/20"
    case "failed":
      return "text-red-400 bg-red-400/20"
    default:
      return "text-slate-400 bg-slate-400/20"
  }
}

export default function Dashboard({ user }: { user: ManusUser }) {
  const [stats] = useState(defaultStats)
  const [recentProjects] = useState(defaultRecentProjects)

  const welcomeName = useMemo(() => user.name.split(" ")[0] || "Founder", [user.name])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-white">Welcome back, {welcomeName}! 👋</h1>
            <p className="text-slate-300">
              Ready to unlock your next funding opportunity? Your AI-powered intelligence platform is ready.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="font-semibold text-cyan-400">Powered by Abasensor™</div>
              <div className="text-sm text-slate-400">Advanced Signal Processing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Projects</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
              <FileText className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            +12% from last month
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Average Score</p>
              <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            +3.2% improvement
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
              <Award className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            Above industry avg
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Funding</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalFunding)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/20">
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            +28% this quarter
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={scoreData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                fill="url(#colorScore)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Project Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-300">{item.name}</span>
                <span className="text-sm text-slate-400">({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
            <button className="flex items-center text-sm text-cyan-400 transition hover:text-cyan-300">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-lg bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700/60">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{project.title}</h4>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(project.status)}`}>{project.status}</span>
                    <span className="text-sm text-slate-400">{project.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{project.score}%</div>
                  <div className="text-sm text-slate-400">{Math.round(project.funding_probability * 100)}% probability</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Matched Opportunities</h3>
            <button className="flex items-center text-sm text-cyan-400 transition hover:text-cyan-300">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="rounded-lg bg-slate-800 p-4 shadow-sm ring-1 ring-slate-700/60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{opp.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{opp.funder}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="font-medium text-green-400">{opp.amount}</span>
                      <span className="text-slate-400">Due: {opp.deadline}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-cyan-400">{opp.match_score}%</div>
                    <div className="text-sm text-slate-400">match</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="flex items-center space-x-3 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 transition hover:from-cyan-500/30 hover:to-blue-500/30">
            <Zap className="h-6 w-6 text-cyan-400" />
            <div className="text-left">
              <div className="font-medium text-white">Evaluate New Project</div>
              <div className="text-sm text-slate-400">Get AI-powered analysis</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-slate-600 bg-slate-750 p-4 transition hover:bg-slate-700">
            <Target className="h-6 w-6 text-green-400" />
            <div className="text-left">
              <div className="font-medium text-white">Find Opportunities</div>
              <div className="text-sm text-slate-400">Discover funding matches</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-slate-600 bg-slate-750 p-4 transition hover:bg-slate-700">
            <FileText className="h-6 w-6 text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-white">Generate Report</div>
              <div className="text-sm text-slate-400">Download analysis</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
