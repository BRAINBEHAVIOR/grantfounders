"use client"

import { RiskItem } from "@/lib/types"

interface RiskMatrixProps {
  risks: RiskItem[]
}

export function RiskMatrix({ risks }: RiskMatrixProps) {
  // Create a 5x5 grid for risk placement
  const gridSize = 5
  
  const getRiskPosition = (risk: RiskItem) => {
    // probability is X axis (1-5), impact is Y axis (1-5)
    // Convert to 0-indexed grid positions
    const x = risk.probability - 1
    const y = gridSize - risk.impact // Invert Y so high impact is at top
    return { x, y }
  }
  
  const getStatusColor = (status: RiskItem["status"]) => {
    switch (status) {
      case "critical": return "bg-destructive"
      case "warning": return "bg-warning"
      case "manageable": return "bg-success"
    }
  }
  
  const getCellColor = (x: number, y: number) => {
    // x = probability (0-4, left to right)
    // y = inverted impact (0-4, top to bottom, where 0 = high impact)
    const impact = gridSize - y - 1 // Convert back to actual impact
    const probability = x + 1
    const riskScore = impact * probability
    
    if (riskScore >= 15) return "bg-destructive/20"
    if (riskScore >= 8) return "bg-warning/20"
    return "bg-success/10"
  }
  
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Risk Matrix</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Manageable</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
          Impact
        </div>
        
        {/* Grid */}
        <div className="ml-4">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize
              const y = Math.floor(index / gridSize)
              
              // Find risks at this position
              const risksAtPosition = risks.filter(risk => {
                const pos = getRiskPosition(risk)
                return pos.x === x && pos.y === y
              })
              
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-md ${getCellColor(x, y)} flex items-center justify-center relative group`}
                >
                  {risksAtPosition.map((risk, i) => (
                    <div
                      key={risk.id}
                      className={`w-4 h-4 rounded-full ${getStatusColor(risk.status)} border-2 border-card absolute`}
                      style={{
                        transform: `translate(${i * 4}px, ${i * 4}px)`,
                      }}
                    />
                  ))}
                  
                  {/* Tooltip */}
                  {risksAtPosition.length > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg whitespace-nowrap">
                        {risksAtPosition.map(r => r.title).join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* X-axis label */}
          <div className="text-center mt-2 text-xs text-muted-foreground">
            Probability
          </div>
        </div>
      </div>
      
      {/* Risk Count Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-destructive/10 p-3">
          <div className="text-2xl font-bold text-destructive">
            {risks.filter(r => r.status === "critical").length}
          </div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
        <div className="rounded-lg bg-warning/10 p-3">
          <div className="text-2xl font-bold text-warning">
            {risks.filter(r => r.status === "warning").length}
          </div>
          <div className="text-xs text-muted-foreground">Warning</div>
        </div>
        <div className="rounded-lg bg-success/10 p-3">
          <div className="text-2xl font-bold text-success">
            {risks.filter(r => r.status === "manageable").length}
          </div>
          <div className="text-xs text-muted-foreground">Manageable</div>
        </div>
      </div>
    </div>
  )
}
