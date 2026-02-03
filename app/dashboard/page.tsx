"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ScoreCard } from "@/components/dashboard/score-card"
import { RiskMatrix } from "@/components/dashboard/risk-matrix"
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown"
import { ActionEngine } from "@/components/dashboard/action-engine"
import { QuickWins } from "@/components/dashboard/quick-wins"
import { AnalyzingOverlay } from "@/components/dashboard/analyzing-overlay"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { mockACEScore, mockRisks, mockActions } from "@/lib/mock-data"
import { ACEScore, RiskItem, ActionItem } from "@/lib/types"

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [aceScore, setAceScore] = useState<ACEScore | null>(null)
  const [risks, setRisks] = useState<RiskItem[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [userPlan] = useState<"free" | "pro" | "enterprise">("free")
  
  // Simulate analysis on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAceScore(mockACEScore)
      setRisks(mockRisks)
      setActions(mockActions)
      setIsAnalyzing(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const toggleActionStatus = (id: string) => {
    const action = actions.find(a => a.id === id)
    if (action?.isLocked) {
      setShowUpgradeModal(true)
      return
    }
    setActions(actions.map(a => 
      a.id === id 
        ? { ...a, status: a.status === "done" ? "todo" : "done" }
        : a
    ))
  }
  
  const criticalRisks = risks.filter(r => r.status === "critical")
  const p0Actions = actions.filter(a => a.priority === "P0" && a.status !== "done")
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar userPlan={userPlan} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          companyName="Acme AI" 
          onUpgrade={() => setShowUpgradeModal(true)}
          userPlan={userPlan}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Score Section */}
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <div className="lg:col-span-1">
              <ScoreCard score={aceScore} />
            </div>
            <div className="lg:col-span-2">
              <CategoryBreakdown score={aceScore} />
            </div>
          </div>
          
          {/* Risk & Quick Wins Section */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <RiskMatrix risks={risks} />
            <QuickWins 
              criticalRisks={criticalRisks}
              p0Actions={p0Actions}
            />
          </div>
          
          {/* Action Engine */}
          <ActionEngine 
            actions={actions}
            onToggleAction={toggleActionStatus}
            userPlan={userPlan}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </main>
      </div>
      
      {/* Overlays */}
      {isAnalyzing && <AnalyzingOverlay />}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  )
}
