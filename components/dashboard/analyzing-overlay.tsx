"use client"

import { useState, useEffect } from "react"

const analysisSteps = [
  { label: "Parsing proposal content", duration: 800 },
  { label: "Analyzing agency alignment", duration: 700 },
  { label: "Evaluating commercial potential", duration: 600 },
  { label: "Assessing team capabilities", duration: 500 },
  { label: "Identifying risk factors", duration: 600 },
  { label: "Generating action items", duration: 500 },
  { label: "Calculating ACE score", duration: 300 },
]

export function AnalyzingOverlay() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0
    
    const interval = setInterval(() => {
      elapsed += 50
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)
      
      // Calculate current step
      let stepTime = 0
      for (let i = 0; i < analysisSteps.length; i++) {
        stepTime += analysisSteps[i].duration
        if (elapsed < stepTime) {
          setCurrentStep(i)
          break
        }
      }
      
      if (elapsed >= totalDuration) {
        setCurrentStep(analysisSteps.length - 1)
        clearInterval(interval)
      }
    }, 50)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary animate-pulse">
            <span className="text-xl font-bold text-primary-foreground">GF</span>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground text-center mb-2">
          Analyzing Your Proposal
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          GF-777ACE kernel processing...
        </p>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Steps */}
        <div className="space-y-2">
          {analysisSteps.map((step, index) => {
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                  isCurrent ? "bg-primary/10" : ""
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${
                  isComplete 
                    ? "bg-primary" 
                    : isCurrent 
                    ? "bg-primary animate-pulse" 
                    : "bg-muted"
                }`} />
                <span className={`text-sm ${
                  isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
                {isComplete && (
                  <span className="ml-auto text-xs text-primary">Done</span>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          This usually takes 5-10 seconds
        </p>
      </div>
    </div>
  )
}
