"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Users } from "lucide-react"

interface TeamInfoStepProps {
  data: {
    founderBackground: string
    teamQualifications: string
    advisors: string
  }
  onUpdate: (data: Partial<TeamInfoStepProps["data"]>) => void
  onNext: () => void
  onBack: () => void
}

export function TeamInfoStep({ data, onUpdate, onNext, onBack }: TeamInfoStepProps) {
  const isValid = data.founderBackground && data.teamQualifications
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Team Information</h1>
        <p className="mt-2 text-muted-foreground">
          Strong teams are critical for grant success. Tell us about yours.
        </p>
      </div>
      
      {/* Form */}
      <div className="mx-auto max-w-lg space-y-6">
        {/* Founder Background */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Founder/PI Background</label>
          <textarea
            value={data.founderBackground}
            onChange={(e) => onUpdate({ founderBackground: e.target.value })}
            placeholder="PhD in Computer Science from Stanford, 10+ years in AI research at Google..."
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Include degrees, relevant experience, and previous grant experience
          </p>
        </div>
        
        {/* Team Qualifications */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Key Team Qualifications</label>
          <textarea
            value={data.teamQualifications}
            onChange={(e) => onUpdate({ teamQualifications: e.target.value })}
            placeholder="CTO: 15 years ML experience, former Meta AI. VP Engineering: Led teams at two successful exits..."
            rows={4}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
        
        {/* Advisors */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Advisors & Consultants (Optional)</label>
          <textarea
            value={data.advisors}
            onChange={(e) => onUpdate({ advisors: e.target.value })}
            placeholder="Dr. Jane Smith - Former NSF Program Director, Prof. John Doe - MIT CSAIL..."
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Relevant advisors can significantly strengthen your application
          </p>
        </div>
        
        {/* Tip Box */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-primary">Pro tip:</span> NSF and NIH weight team qualifications heavily. 
            Include specific metrics (papers published, grants received, patents filed) when possible.
          </p>
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
