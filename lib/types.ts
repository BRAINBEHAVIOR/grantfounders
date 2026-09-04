export interface StartupProfile {
  id: string
  companyName: string
  industry: string
  stage: "pre-seed" | "seed" | "series-a" | "series-b"
  teamSize: number
  monthlyRevenue: number
  fundingGoal: number
  targetAgency: string[]
  technologyReadinessLevel: number
  previousGrants: number
  createdAt: Date
}

export interface ProposalData {
  title: string
  abstract: string
  problemStatement: string
  technicalApproach: string
  commercializationPlan: string
  teamQualifications: string
  budget: number
  timeline: number // months
}

export interface ACEScore {
  overall: number
  breakdown: {
    alignment: number      // Agency alignment score
    commercialization: number  // Commercial potential
    execution: number      // Team & execution capability
  }
  confidence: number
  timestamp: Date
}

export interface RiskItem {
  id: string
  category: "product" | "ops" | "funding" | "compliance" | "team"
  title: string
  description: string
  probability: 1 | 2 | 3 | 4 | 5  // 1=low, 5=high
  impact: 1 | 2 | 3 | 4 | 5       // 1=low, 5=high
  status: "critical" | "warning" | "manageable"
  recommendation: string
}

export interface ActionItem {
  id: string
  priority: "P0" | "P1" | "P2"
  title: string
  description: string
  category: "product" | "ops" | "funding" | "compliance" | "team"
  owner: string
  timeline: string
  estimatedImpact: number // 1-10
  status: "todo" | "in-progress" | "done"
  isLocked: boolean // requires upgrade
}

export interface UserPlan {
  tier: "free" | "pro" | "enterprise"
  analysesRemaining: number
  featuresUnlocked: string[]
}

export type OnboardingStep = 
  | "company-info"
  | "grant-target"
  | "proposal-details"
  | "team-info"
  | "review"
