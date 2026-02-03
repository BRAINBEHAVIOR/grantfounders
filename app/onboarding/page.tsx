"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStep } from "@/lib/types"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import { CompanyInfoStep } from "@/components/onboarding/company-info-step"
import { GrantTargetStep } from "@/components/onboarding/grant-target-step"
import { ProposalDetailsStep } from "@/components/onboarding/proposal-details-step"
import { TeamInfoStep } from "@/components/onboarding/team-info-step"
import { ReviewStep } from "@/components/onboarding/review-step"

const steps: OnboardingStep[] = [
  "company-info",
  "grant-target", 
  "proposal-details",
  "team-info",
  "review",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("company-info")
  const [formData, setFormData] = useState({
    // Company Info
    companyName: "",
    industry: "",
    stage: "",
    teamSize: "",
    monthlyRevenue: "",
    
    // Grant Target
    targetAgency: [] as string[],
    fundingGoal: "",
    previousGrants: "",
    technologyReadinessLevel: "",
    
    // Proposal Details
    title: "",
    abstract: "",
    problemStatement: "",
    technicalApproach: "",
    
    // Team Info
    founderBackground: "",
    teamQualifications: "",
    advisors: "",
  })
  
  const currentStepIndex = steps.indexOf(currentStep)
  
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }
  
  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }
  
  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }
  
  const handleComplete = () => {
    // Store form data in localStorage for dashboard
    localStorage.setItem("gf_onboarding_data", JSON.stringify(formData))
    router.push("/dashboard")
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">GF</span>
            </div>
            <span className="text-lg font-semibold text-foreground">GrantFounders</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
          completedSteps={steps.slice(0, currentStepIndex)}
        />
        
        {/* Step Content */}
        <div className="mt-8">
          {currentStep === "company-info" && (
            <CompanyInfoStep
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
            />
          )}
          {currentStep === "grant-target" && (
            <GrantTargetStep
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "proposal-details" && (
            <ProposalDetailsStep
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "team-info" && (
            <TeamInfoStep
              data={formData}
              onUpdate={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === "review" && (
            <ReviewStep
              data={formData}
              onBack={prevStep}
              onComplete={handleComplete}
            />
          )}
        </div>
      </main>
    </div>
  )
}
