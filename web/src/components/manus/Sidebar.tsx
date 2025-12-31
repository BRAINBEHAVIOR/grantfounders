"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderOpen, BarChart3, CreditCard, Settings, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import type { ManusUser } from "./index"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  user: ManusUser
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={`fixed left-0 top-0 z-40 h-full border-r border-slate-800 bg-slate-900 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">GrantFounders</div>
              <div className="text-xs text-cyan-400">Powered by Abasensor™</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
              <span className="text-sm font-semibold text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-white">{user.name}</div>
              <div className="truncate text-sm text-slate-400">{user.organization}</div>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-slate-800 p-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Plan</span>
              <span className="capitalize text-cyan-400">{user.subscription.plan}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Usage</span>
              <span>
                {user.subscription.monthly_evaluations_used}/{user.subscription.monthly_evaluations_limit}
              </span>
            </div>
            <div className="mt-1 h-1 w-full rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{
                  width: `${Math.min(
                    100,
                    (user.subscription.monthly_evaluations_used / user.subscription.monthly_evaluations_limit) * 100,
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {isOpen && (
        <div className="p-4 text-center text-xs text-slate-500">
          <div>GrantFounders v3.0.0</div>
          <div className="mt-1">Powered by Abasensor™ Technology</div>
        </div>
      )}
    </div>
  )
}
