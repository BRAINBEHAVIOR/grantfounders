"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, Sparkles, Menu } from "lucide-react"

interface DashboardHeaderProps {
  companyName: string
  onUpgrade: () => void
  userPlan: "free" | "pro" | "enterprise"
}

export function DashboardHeader({ companyName, onUpgrade, userPlan }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{companyName}</h1>
          <p className="text-xs text-muted-foreground">Grant Readiness Dashboard</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
        
        {/* Plan Badge & Upgrade */}
        {userPlan === "free" ? (
          <Button
            onClick={onUpgrade}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        ) : (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {userPlan === "pro" ? "Pro" : "Enterprise"}
          </span>
        )}
        
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
          AC
        </div>
      </div>
    </header>
  )
}
