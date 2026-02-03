"use client"

import { ACEScore } from "@/lib/types"
import { Target, TrendingUp, Users } from "lucide-react"

interface CategoryBreakdownProps {
  score: ACEScore | null
}

const categories = [
  {
    key: "alignment" as const,
    label: "Agency Alignment",
    description: "How well your proposal matches agency priorities",
    icon: Target,
  },
  {
    key: "commercialization" as const,
    label: "Commercial Potential",
    description: "Market opportunity and go-to-market readiness",
    icon: TrendingUp,
  },
  {
    key: "execution" as const,
    label: "Execution Capability",
    description: "Team strength and technical feasibility",
    icon: Users,
  },
]

export function CategoryBreakdown({ score }: CategoryBreakdownProps) {
  if (!score) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-full animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }
  
  const getBarColor = (value: number) => {
    if (value >= 80) return "bg-success"
    if (value >= 60) return "bg-warning"
    return "bg-destructive"
  }
  
  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-6">ACE Breakdown</h3>
      
      <div className="space-y-6">
        {categories.map((category) => {
          const value = score.breakdown[category.key]
          const Icon = category.icon
          
          return (
            <div key={category.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{category.label}</span>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">{value}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getBarColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Strong (80+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">Moderate (60-79)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Needs Work (&lt;60)</span>
        </div>
      </div>
    </div>
  )
}
