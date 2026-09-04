"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, FileText } from "lucide-react"

interface ProposalDetailsStepProps {
  data: {
    title: string
    abstract: string
    problemStatement: string
    technicalApproach: string
  }
  onUpdate: (data: Partial<ProposalDetailsStepProps["data"]>) => void
  onNext: () => void
  onBack: () => void
}

export function ProposalDetailsStep({ data, onUpdate, onNext, onBack }: ProposalDetailsStepProps) {
  const isValid = data.title && data.abstract && data.problemStatement
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Proposal Details</h1>
        <p className="mt-2 text-muted-foreground">
          Provide the core elements of your proposal for analysis
        </p>
      </div>
      
      {/* Form */}
      <div className="mx-auto max-w-lg space-y-6">
        {/* Project Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Project Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="AI-Powered Solution for..."
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        {/* Abstract */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Project Abstract</label>
          <textarea
            value={data.abstract}
            onChange={(e) => onUpdate({ abstract: e.target.value })}
            placeholder="Brief summary of your proposed research and development..."
            rows={4}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {data.abstract.length}/500 characters
          </p>
        </div>
        
        {/* Problem Statement */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Problem Statement</label>
          <textarea
            value={data.problemStatement}
            onChange={(e) => onUpdate({ problemStatement: e.target.value })}
            placeholder="What specific problem does your technology solve?"
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        
        {/* Technical Approach */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Technical Approach (Optional)</label>
          <textarea
            value={data.technicalApproach}
            onChange={(e) => onUpdate({ technicalApproach: e.target.value })}
            placeholder="Describe your innovative technical approach..."
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
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
