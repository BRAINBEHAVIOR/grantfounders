"use client"

import { useState } from "react"
import { ActionItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  Clock,
  User,
  Zap,
  Filter
} from "lucide-react"

interface ActionEngineProps {
  actions: ActionItem[]
  onToggleAction: (id: string) => void
  userPlan: "free" | "pro" | "enterprise"
  onUpgrade: () => void
}

const priorityConfig = {
  P0: { label: "Critical", color: "bg-destructive", textColor: "text-destructive" },
  P1: { label: "High", color: "bg-warning", textColor: "text-warning" },
  P2: { label: "Medium", color: "bg-info", textColor: "text-info" },
}

const categoryConfig = {
  product: { label: "Product", color: "bg-purple-500/20 text-purple-400" },
  ops: { label: "Operations", color: "bg-blue-500/20 text-blue-400" },
  funding: { label: "Funding", color: "bg-green-500/20 text-green-400" },
  compliance: { label: "Compliance", color: "bg-orange-500/20 text-orange-400" },
  team: { label: "Team", color: "bg-pink-500/20 text-pink-400" },
}

export function ActionEngine({ actions, onToggleAction, userPlan, onUpgrade }: ActionEngineProps) {
  const [expandedPriority, setExpandedPriority] = useState<string | null>("P0")
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all")
  
  const groupedActions = {
    P0: actions.filter(a => a.priority === "P0"),
    P1: actions.filter(a => a.priority === "P1"),
    P2: actions.filter(a => a.priority === "P2"),
  }
  
  const filteredActions = (priority: "P0" | "P1" | "P2") => {
    const priorityActions = groupedActions[priority]
    if (filter === "all") return priorityActions
    if (filter === "todo") return priorityActions.filter(a => a.status !== "done")
    return priorityActions.filter(a => a.status === "done")
  }
  
  const completedCount = actions.filter(a => a.status === "done").length
  const totalCount = actions.length
  
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Action Engine</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated prioritized checklist to improve your score
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
          
          {/* Filter */}
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "all" 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("todo")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "todo" 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter("done")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "done" 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
      
      {/* Action Groups */}
      <div className="divide-y divide-border">
        {(["P0", "P1", "P2"] as const).map((priority) => {
          const config = priorityConfig[priority]
          const priorityActions = filteredActions(priority)
          const isExpanded = expandedPriority === priority
          const doneCount = groupedActions[priority].filter(a => a.status === "done").length
          const totalPriorityCount = groupedActions[priority].length
          
          return (
            <div key={priority}>
              {/* Priority Header */}
              <button
                onClick={() => setExpandedPriority(isExpanded ? null : priority)}
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`rounded px-2 py-1 text-xs font-bold ${config.color} text-white`}>
                    {priority}
                  </span>
                  <span className="font-medium text-foreground">{config.label} Priority</span>
                  <span className="text-sm text-muted-foreground">
                    ({doneCount}/{totalPriorityCount} complete)
                  </span>
                </div>
                
                {priority === "P2" && userPlan === "free" && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Pro
                  </span>
                )}
              </button>
              
              {/* Action Items */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {priorityActions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No actions in this category
                    </p>
                  ) : (
                    priorityActions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onToggle={() => onToggleAction(action.id)}
                        onUpgrade={onUpgrade}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ActionCardProps {
  action: ActionItem
  onToggle: () => void
  onUpgrade: () => void
}

function ActionCard({ action, onToggle, onUpgrade }: ActionCardProps) {
  const isDone = action.status === "done"
  const categoryStyle = categoryConfig[action.category]
  
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isDone 
          ? "border-border bg-muted/30 opacity-60" 
          : action.isLocked
          ? "border-border bg-card"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={action.isLocked ? onUpgrade : onToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            isDone
              ? "border-primary bg-primary"
              : action.isLocked
              ? "border-muted-foreground/30 bg-muted cursor-not-allowed"
              : "border-muted-foreground hover:border-primary"
          }`}
        >
          {isDone && <Check className="h-3 w-3 text-primary-foreground" />}
          {action.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {action.title}
            </h4>
            <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${categoryStyle.color}`}>
              {categoryStyle.label}
            </span>
          </div>
          
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {action.description}
          </p>
          
          {/* Meta */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{action.owner}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{action.timeline}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-primary">+{action.estimatedImpact} impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
