"use client"

import { agencyOptions } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Building2, Target, FileText, Users } from "lucide-react"

interface ReviewStepProps {
  data: {
    companyName: string
    industry: string
    stage: string
    teamSize: string
    targetAgency: string[]
    fundingGoal: string
    title: string
    abstract: string
    founderBackground: string
  }
  onBack: () => void
  onComplete: () => void
}

export function ReviewStep({ data, onBack, onComplete }: ReviewStepProps) {
  const getAgencyLabel = (value: string) => {
    return agencyOptions.find((a) => a.value === value)?.label || value
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ready to analyze</h1>
        <p className="mt-2 text-muted-foreground">
          Review your information before we run the ACE analysis
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Company Info */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Company Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Company:</span>
              <span className="ml-2 text-foreground">{data.companyName || "Not provided"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Industry:</span>
              <span className="ml-2 text-foreground">{data.industry || "Not provided"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stage:</span>
              <span className="ml-2 text-foreground capitalize">{data.stage || "Not provided"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Team Size:</span>
              <span className="ml-2 text-foreground">{data.teamSize || "Not provided"}</span>
            </div>
          </div>
        </div>
        
        {/* Grant Target */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Grant Target</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Target Agencies:</span>
              <span className="ml-2 text-foreground">
                {data.targetAgency.length > 0 
                  ? data.targetAgency.map(getAgencyLabel).join(", ")
                  : "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Funding Goal:</span>
              <span className="ml-2 text-foreground">
                {data.fundingGoal ? `$${parseInt(data.fundingGoal).toLocaleString()}` : "Not provided"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Proposal */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Proposal</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 text-foreground">{data.title || "Not provided"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Abstract:</span>
              <p className="mt-1 text-foreground line-clamp-2">
                {data.abstract || "Not provided"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Team */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Team</h3>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Founder/PI:</span>
            <p className="mt-1 text-foreground line-clamp-2">
              {data.founderBackground || "Not provided"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          onClick={onComplete}
          size="lg"
          className="min-w-[280px] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Run ACE Analysis
        </Button>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back and edit
        </Button>
      </div>
      
      {/* Trust Badge */}
      <p className="text-center text-xs text-muted-foreground">
        Your data is encrypted and never shared. Analysis powered by GF-777ACE kernel.
      </p>
    </div>
  )
}
