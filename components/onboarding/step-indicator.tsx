"use client"

import { OnboardingStep } from "@/lib/types"
import { Check } from "lucide-react"

const stepLabels: Record<OnboardingStep, string> = {
  "company-info": "Company",
  "grant-target": "Grant Target",
  "proposal-details": "Proposal",
  "team-info": "Team",
  "review": "Review",
}

interface StepIndicatorProps {
  steps: OnboardingStep[]
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step)
        const isCurrent = step === currentStep
        const isLast = index === steps.length - 1
        
        return (
          <div key={step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stepLabels[step]}
              </span>
            </div>
            
            {/* Connector Line */}
            {!isLast && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
