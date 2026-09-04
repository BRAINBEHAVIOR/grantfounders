"use client"

import { RiskItem, ActionItem } from "@/lib/types"
import { AlertTriangle, Zap, ArrowRight } from "lucide-react"

interface QuickWinsProps {
  criticalRisks: RiskItem[]
  p0Actions: ActionItem[]
}

export function QuickWins({ criticalRisks, p0Actions }: QuickWinsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Priority Focus</h3>
      
      <div className="space-y-4">
        {/* Critical Blockers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            </div>
            <span className="text-sm font-medium text-foreground">Critical Blockers</span>
            <span className="ml-auto text-xs text-destructive font-medium">
              {criticalRisks.length} issues
            </span>
          </div>
          
          <div className="space-y-2">
            {criticalRisks.slice(0, 2).map((risk) => (
              <div
                key={risk.id}
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{risk.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {risk.recommendation}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                    {risk.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Wins */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Quick Wins (P0)</span>
            <span className="ml-auto text-xs text-primary font-medium">
              {p0Actions.length} actions
            </span>
          </div>
          
          <div className="space-y-2">
            {p0Actions.slice(0, 2).map((action) => (
              <div
                key={action.id}
                className="rounded-lg border border-primary/20 bg-primary/5 p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{action.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{action.owner}</span>
                      <span>{action.timeline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <span>+{action.estimatedImpact}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Score Projection */}
      <div className="mt-4 rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Complete P0 actions to reach:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">85</span>
            <span className="text-xs text-muted-foreground">projected score</span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-background overflow-hidden">
          <div className="h-full w-[73%] rounded-full bg-warning" />
          <div className="h-full w-[12%] rounded-full bg-primary/50 -mt-2 ml-[73%]" />
        </div>
      </div>
    </div>
  )
}
