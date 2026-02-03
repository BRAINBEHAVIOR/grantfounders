"use client"

import Link from "next/link"
import { 
  LayoutDashboard, 
  Target, 
  FileText, 
  Settings, 
  Users,
  CreditCard,
  Zap,
  HelpCircle,
  ChevronRight
} from "lucide-react"

interface DashboardSidebarProps {
  userPlan: "free" | "pro" | "enterprise"
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Target, label: "Risk Analysis", href: "/dashboard/risks", locked: false },
  { icon: FileText, label: "Proposals", href: "/dashboard/proposals", locked: true },
  { icon: Users, label: "Team", href: "/dashboard/team", locked: true },
  { icon: Zap, label: "Automations", href: "/dashboard/automations", locked: true, badge: "Soon" },
]

const bottomItems = [
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
]

export function DashboardSidebar({ userPlan }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">GF</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">GrantFounders</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isLocked = item.locked && userPlan === "free"
            
            return (
              <Link
                key={item.label}
                href={isLocked ? "#" : item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : isLocked
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-sidebar-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {item.badge}
                  </span>
                )}
                {isLocked && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Pro
                  </span>
                )}
              </Link>
            )
          })}
        </div>
        
        {/* Upgrade CTA */}
        {userPlan === "free" && (
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="font-medium text-sidebar-foreground">Unlock Full Power</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Get unlimited analyses, team features, and AI automations.
            </p>
            <Link
              href="/pricing"
              className="mt-3 flex items-center text-sm font-medium text-primary hover:underline"
            >
              Upgrade to Pro
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </nav>
      
      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border p-4">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-muted"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
