"use client"

import { agencyOptions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Target } from "lucide-react"

interface GrantTargetStepProps {
  data: {
    targetAgency: string[]
    fundingGoal: string
    previousGrants: string
    technologyReadinessLevel: string
  }
  onUpdate: (data: Partial<GrantTargetStepProps["data"]>) => void
  onNext: () => void
  onBack: () => void
}

export function GrantTargetStep({ data, onUpdate, onNext, onBack }: GrantTargetStepProps) {
  const isValid = data.targetAgency.length > 0 && data.fundingGoal
  
  const toggleAgency = (agency: string) => {
    const current = data.targetAgency
    if (current.includes(agency)) {
      onUpdate({ targetAgency: current.filter((a) => a !== agency) })
    } else {
      onUpdate({ targetAgency: [...current, agency] })
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Target className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Define your grant target</h1>
        <p className="mt-2 text-muted-foreground">
          Select agencies and funding goals for your SBIR/STTR application
        </p>
      </div>
      
      {/* Form */}
      <div className="mx-auto max-w-lg space-y-6">
        {/* Target Agencies */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Target Agencies (select all that apply)</label>
          <div className="grid gap-3">
            {agencyOptions.map((agency) => (
              <button
                key={agency.value}
                onClick={() => toggleAgency(agency.value)}
                className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                  data.targetAgency.includes(agency.value)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div>
                  <span className="font-medium text-foreground">{agency.label}</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  Avg: {agency.avgAward}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Funding Goal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Funding Goal</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={data.fundingGoal}
              onChange={(e) => onUpdate({ fundingGoal: e.target.value })}
              placeholder="250000"
              min="0"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 pl-8 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Phase I typically ranges from $100K to $275K depending on agency
          </p>
        </div>
        
        {/* Previous Grants */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Previous SBIR/STTR Grants</label>
          <select
            value={data.previousGrants}
            onChange={(e) => onUpdate({ previousGrants: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="0">None - First time applicant</option>
            <option value="1-2">1-2 grants received</option>
            <option value="3-5">3-5 grants received</option>
            <option value="5+">More than 5 grants</option>
          </select>
        </div>
        
        {/* TRL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Technology Readiness Level (TRL)</label>
          <select
            value={data.technologyReadinessLevel}
            onChange={(e) => onUpdate({ technologyReadinessLevel: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select TRL...</option>
            <option value="1-2">TRL 1-2: Basic research</option>
            <option value="3-4">TRL 3-4: Proof of concept</option>
            <option value="5-6">TRL 5-6: Technology demonstration</option>
            <option value="7-9">TRL 7-9: System complete</option>
          </select>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[120px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
