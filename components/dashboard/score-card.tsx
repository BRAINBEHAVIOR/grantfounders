"use client"

import { ACEScore } from "@/lib/types"
import { TrendingUp, Shield } from "lucide-react"

interface ScoreCardProps {
  score: ACEScore | null
}

export function ScoreCard({ score }: ScoreCardProps) {
  if (!score) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 h-full animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-32 w-32 mx-auto bg-muted rounded-full" />
      </div>
    )
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong"
    if (score >= 60) return "Moderate"
    return "Needs Work"
  }
  
  const circumference = 2 * Math.PI * 58
  const strokeDashoffset = circumference - (score.overall / 100) * circumference
  
  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-muted-foreground">ACE Score</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>{score.confidence}% confidence</span>
        </div>
      </div>
      
      {/* Circular Score */}
      <div className="relative flex items-center justify-center">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={getScoreColor(score.overall)}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}
          </span>
          <span className="text-xs text-muted-foreground">out of 100</span>
        </div>
      </div>
      
      {/* Score Label */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <TrendingUp className={`h-4 w-4 ${getScoreColor(score.overall)}`} />
        <span className={`text-sm font-medium ${getScoreColor(score.overall)}`}>
          {getScoreLabel(score.overall)} Position
        </span>
      </div>
      
      {/* Score Interpretation */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Your proposal is in the <span className="text-foreground font-medium">top 35%</span> of similar NSF submissions
      </p>
    </div>
  )
}
