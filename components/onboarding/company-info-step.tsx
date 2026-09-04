"use client"

import { industryOptions, stageOptions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2 } from "lucide-react"

interface CompanyInfoStepProps {
  data: {
    companyName: string
    industry: string
    stage: string
    teamSize: string
    monthlyRevenue: string
  }
  onUpdate: (data: Partial<CompanyInfoStepProps["data"]>) => void
  onNext: () => void
}

export function CompanyInfoStep({ data, onUpdate, onNext }: CompanyInfoStepProps) {
  const isValid = data.companyName && data.industry && data.stage
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Tell us about your company</h1>
        <p className="mt-2 text-muted-foreground">
          This helps us match you with the right grant opportunities
        </p>
      </div>
      
      {/* Form */}
      <div className="mx-auto max-w-lg space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onUpdate({ companyName: e.target.value })}
            placeholder="Acme Corp"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        {/* Industry */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <select
            value={data.industry}
            onChange={(e) => onUpdate({ industry: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select industry...</option>
            {industryOptions.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
        
        {/* Stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Funding Stage</label>
          <div className="grid grid-cols-2 gap-3">
            {stageOptions.map((stage) => (
              <button
                key={stage.value}
                onClick={() => onUpdate({ stage: stage.value })}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  data.stage === stage.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <span className="font-medium text-foreground">{stage.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {stage.description}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Team Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Team Size</label>
          <input
            type="number"
            value={data.teamSize}
            onChange={(e) => onUpdate({ teamSize: e.target.value })}
            placeholder="5"
            min="1"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        {/* Monthly Revenue */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Monthly Revenue (Optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={data.monthlyRevenue}
              onChange={(e) => onUpdate({ monthlyRevenue: e.target.value })}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 pl-8 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-center pt-4">
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
