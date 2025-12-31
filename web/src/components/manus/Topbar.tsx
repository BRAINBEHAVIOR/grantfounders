"use client"

import { useState } from "react"
import { Bell, Search, Menu, LogOut, User, Settings as SettingsIcon } from "lucide-react"
import type { ManusUser } from "./index"

interface TopbarProps {
  user: ManusUser
  onLogout?: () => void
  onToggleSidebar?: () => void
}

export default function Topbar({ user, onLogout, onToggleSidebar }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    {
      id: 1,
      title: "Project Evaluation Complete",
      message: "AI-Powered Climate Monitoring System scored 87.3%",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "New Funding Opportunity",
      message: "Climate Innovation Fund - $2M available",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Monthly Report Ready",
      message: "Your December analytics report is available",
      time: "3 hours ago",
      unread: false,
    },
  ]

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, opportunities..."
              className="w-64 rounded-lg border border-slate-700 bg-slate-800 px-10 py-2 text-white placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.some((n) => n.unread) && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                <div className="border-b border-slate-700 p-4">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-700 p-4 transition-colors hover:bg-slate-750 ${
                        notification.unread ? "bg-slate-750/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                          <p className="mt-2 text-xs text-slate-500">{notification.time}</p>
                        </div>
                        {notification.unread && <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 p-3 text-center">
                  <button className="text-sm text-cyan-400 transition-colors hover:text-cyan-300">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
                <span className="text-sm font-semibold text-white">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-slate-400 capitalize">{user.subscription.plan} Plan</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                <div className="p-2">
                  <button className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-2 border-slate-700" />
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-red-400 transition-colors hover:bg-slate-700 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
