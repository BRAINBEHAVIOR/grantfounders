import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  FolderOpen, 
  BarChart3, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function Sidebar({ isOpen, onToggle, user }) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Evaluate Project', href: '/evaluate', icon: Zap },
    { name: 'My Projects', href: '/projects', icon: FolderOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">GrantFounders</div>
              <div className="text-xs text-cyan-400">Powered by Abasensor™</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* User Info */}
      {isOpen && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{user.name}</div>
              <div className="text-slate-400 text-sm truncate">{user.organization}</div>
            </div>
          </div>
          
          {/* Subscription Status */}
          <div className="mt-3 p-2 bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Plan</span>
              <span className="text-xs font-medium text-cyan-400 capitalize">
                {user.subscription.plan}
              </span>
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Usage</span>
                <span>{user.subscription.monthly_evaluations_used}/{user.subscription.monthly_evaluations_limit}</span>
              </div>
              <div className="mt-1 w-full bg-slate-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(user.subscription.monthly_evaluations_used / user.subscription.monthly_evaluations_limit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">
            <div>GrantFounders v2.1.0</div>
            <div className="mt-1">Powered by Abasensor™ Technology</div>
          </div>
        </div>
      )}
    </div>
  );
}

