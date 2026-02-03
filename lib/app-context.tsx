"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { StartupProfile, ProposalData, ACEScore, RiskItem, ActionItem, UserPlan, OnboardingStep } from "./types"
import { mockACEScore, mockRisks, mockActions } from "./mock-data"

interface AppState {
  // User & Plan
  userPlan: UserPlan
  setUserPlan: (plan: UserPlan) => void
  
  // Onboarding
  currentStep: OnboardingStep
  setCurrentStep: (step: OnboardingStep) => void
  profile: Partial<StartupProfile>
  setProfile: (profile: Partial<StartupProfile>) => void
  proposal: Partial<ProposalData>
  setProposal: (proposal: Partial<ProposalData>) => void
  
  // Analysis Results
  aceScore: ACEScore | null
  setAceScore: (score: ACEScore | null) => void
  risks: RiskItem[]
  setRisks: (risks: RiskItem[]) => void
  actions: ActionItem[]
  setActions: (actions: ActionItem[]) => void
  
  // UI State
  isAnalyzing: boolean
  setIsAnalyzing: (val: boolean) => void
  showUpgradeModal: boolean
  setShowUpgradeModal: (val: boolean) => void
  
  // Actions
  runAnalysis: () => Promise<void>
  completeOnboarding: () => void
  toggleActionStatus: (id: string) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // User Plan
  const [userPlan, setUserPlan] = useState<UserPlan>({
    tier: "free",
    analysesRemaining: 1,
    featuresUnlocked: ["basic-score", "top-3-risks", "p0-actions"],
  })
  
  // Onboarding
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("company-info")
  const [profile, setProfile] = useState<Partial<StartupProfile>>({})
  const [proposal, setProposal] = useState<Partial<ProposalData>>({})
  
  // Analysis Results
  const [aceScore, setAceScore] = useState<ACEScore | null>(null)
  const [risks, setRisks] = useState<RiskItem[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  
  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Run Analysis (simulated)
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))
    
    // Set mock results
    setAceScore(mockACEScore)
    setRisks(mockRisks)
    setActions(mockActions)
    setIsAnalyzing(false)
  }
  
  // Complete onboarding and trigger analysis
  const completeOnboarding = () => {
    runAnalysis()
  }
  
  // Toggle action completion
  const toggleActionStatus = (id: string) => {
    setActions(actions.map(a => 
      a.id === id 
        ? { ...a, status: a.status === "done" ? "todo" : "done" }
        : a
    ))
  }
  
  return (
    <AppContext.Provider value={{
      userPlan,
      setUserPlan,
      currentStep,
      setCurrentStep,
      profile,
      setProfile,
      proposal,
      setProposal,
      aceScore,
      setAceScore,
      risks,
      setRisks,
      actions,
      setActions,
      isAnalyzing,
      setIsAnalyzing,
      showUpgradeModal,
      setShowUpgradeModal,
      runAnalysis,
      completeOnboarding,
      toggleActionStatus,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
