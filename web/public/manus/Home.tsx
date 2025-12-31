import React, { useState } from 'react';
import { Zap, DollarSign, Users, Calendar, Tag, Target, Sparkles, TrendingUp, Shield, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluateProject = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GrantFounders</h1>
              <p className="text-xs text-cyan-400">Powered by Abasensor™</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
              Dashboard
            </button>
            <button onClick={() => setActiveTab('evaluate')} className={`text-sm font-medium transition-colors ${activeTab === 'evaluate' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
              Evaluate
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
              Analytics
            </button>
          </nav>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Sign In</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-12 mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-50"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Decision Intelligence for Federal Funding
                </h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl">
                  The GrantFounders Decision Intelligence Operating System predicts funding success with precision. Powered by Abasensor™ advanced signal processing.
                </p>
                <Button onClick={() => setActiveTab('evaluate')} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-lg">
                  Start Evaluation
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 text-sm font-medium">Funding Readiness Score</h3>
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">76%</p>
                <p className="text-xs text-slate-400 mt-2">+12% from last month</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 text-sm font-medium">Active Projects</h3>
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">23</p>
                <p className="text-xs text-slate-400 mt-2">5 in evaluation</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 text-sm font-medium">Approval Rate</h3>
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">87%</p>
                <p className="text-xs text-slate-400 mt-2">Industry avg: 32%</p>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-300 text-sm font-medium">Total Funding</h3>
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">$47.2M</p>
                <p className="text-xs text-slate-400 mt-2">Predicted value</p>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <Card className="bg-slate-900 border-slate-800 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Compliance Firewall</h3>
                    <p className="text-slate-400">Automatic detection of regulatory violations and compliance risks before submission.</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Language Optimization</h3>
                    <p className="text-slate-400">AI-powered recommendations for tone, keywords, and messaging that resonate with target agencies.</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Predictive Forecast</h3>
                    <p className="text-slate-400">Capital allocation predictions based on agency DNA and historical funding patterns.</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Strategic Autopilot</h3>
                    <p className="text-slate-400">Autonomous opportunity matching and prioritization based on your project profile.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'evaluate' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900 border-slate-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Project Evaluation</h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                  <input type="text" placeholder="AI-Powered Climate Monitoring Platform" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea placeholder="Describe your project and its impact..." rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Budget ($)</label>
                    <input type="number" placeholder="1500000" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration (months)</label>
                    <input type="number" placeholder="18" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Environment</option>
                    <option>Infrastructure</option>
                  </select>
                </div>

                <Button onClick={handleEvaluateProject} disabled={isEvaluating} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3">
                  {isEvaluating ? 'Evaluating with Abasensor™...' : 'Evaluate Project'}
                </Button>
              </form>

              {isEvaluating && (
                <div className="mt-8 p-6 bg-slate-800 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                    <p className="text-cyan-400 font-medium">Processing evaluation...</p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
                    </div>
                    <p className="text-sm text-slate-400">The Abasensor™ is analyzing your project against agency DNA profiles...</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-8">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800 p-8">
                <h3 className="text-lg font-semibold text-white mb-6">Funding Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Technology</span>
                      <span className="text-sm font-medium text-white">45%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Healthcare</span>
                      <span className="text-sm font-medium text-white">30%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-400">Environment</span>
                      <span className="text-sm font-medium text-white">25%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{width: '25%'}}></div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-slate-800 p-8">
                <h3 className="text-lg font-semibold text-white mb-6">Success Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-300">Avg FRS Score</span>
                    <span className="text-xl font-bold text-cyan-400">76%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-300">Compliance Pass Rate</span>
                    <span className="text-xl font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <span className="text-slate-300">Avg Processing Time</span>
                    <span className="text-xl font-bold text-blue-400">2.3s</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>GrantFounders Decision Intelligence Operating System • Powered by Abasensor™</p>
          <p className="mt-2">Federal-Grade Security • Multi-Tenant Isolation • Immutable Audit Trail</p>
        </div>
      </footer>
    </div>
  );
}
