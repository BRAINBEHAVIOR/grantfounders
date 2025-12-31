import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock, 
  Zap,
  Target,
  Award,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    avgScore: 0,
    successRate: 0,
    totalFunding: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  // Mock data for demo
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats({
        totalProjects: 47,
        avgScore: 78.4,
        successRate: 73,
        totalFunding: 12400000
      });

      setRecentProjects([
        {
          id: 1,
          title: 'AI-Powered Climate Monitoring System',
          score: 87.3,
          status: 'completed',
          funding_probability: 0.89,
          created_at: '2024-01-15',
          category: 'Technology'
        },
        {
          id: 2,
          title: 'Sustainable Agriculture Platform',
          score: 82.1,
          status: 'completed',
          funding_probability: 0.84,
          created_at: '2024-01-14',
          category: 'Agriculture'
        },
        {
          id: 3,
          title: 'Healthcare Data Analytics Tool',
          score: 75.6,
          status: 'processing',
          funding_probability: 0.76,
          created_at: '2024-01-13',
          category: 'Healthcare'
        }
      ]);

      setOpportunities([
        {
          id: 1,
          title: 'Climate Innovation Fund',
          funder: 'Climate Foundation',
          amount: '$500K - $2M',
          deadline: '2024-03-15',
          match_score: 94
        },
        {
          id: 2,
          title: 'Healthcare Innovation Grant',
          funder: 'National Health Foundation',
          amount: '$250K - $1.5M',
          deadline: '2024-04-01',
          match_score: 87
        },
        {
          id: 3,
          title: 'AI Research Initiative',
          funder: 'Tech Innovation Council',
          amount: '$1M - $5M',
          deadline: '2024-02-28',
          match_score: 91
        }
      ]);
    }, 1000);
  }, []);

  // Chart data
  const scoreData = [
    { month: 'Jul', score: 72 },
    { month: 'Aug', score: 75 },
    { month: 'Sep', score: 78 },
    { month: 'Oct', score: 76 },
    { month: 'Nov', score: 81 },
    { month: 'Dec', score: 78.4 }
  ];

  const categoryData = [
    { name: 'Technology', value: 35, color: '#06b6d4' },
    { name: 'Healthcare', value: 25, color: '#3b82f6' },
    { name: 'Environment', value: 20, color: '#10b981' },
    { name: 'Education', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 8, color: '#8b5cf6' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'processing': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-300">
              Ready to unlock your next funding opportunity? Your AI-powered intelligence platform is ready.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-cyan-400 font-semibold">Powered by Abasensor™</div>
              <div className="text-slate-400 text-sm">Advanced Signal Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% from last month
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            +3.2% improvement
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            Above industry avg
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Funding</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalFunding)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            +28% this quarter
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#06b6d4" 
                fill="url(#colorScore)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-slate-300 text-sm">{item.name}</span>
                <span className="text-slate-400 text-sm">({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-slate-750 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{project.title}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-slate-400 text-sm">{project.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{project.score}%</div>
                  <div className="text-slate-400 text-sm">
                    {Math.round(project.funding_probability * 100)}% probability
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Opportunities */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Matched Opportunities</h3>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-4 bg-slate-750 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{opp.title}</h4>
                    <p className="text-slate-400 text-sm mt-1">{opp.funder}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-green-400 text-sm font-medium">{opp.amount}</span>
                      <span className="text-slate-400 text-sm">Due: {opp.deadline}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold">{opp.match_score}%</div>
                    <div className="text-slate-400 text-sm">match</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all">
            <Zap className="w-6 h-6 text-cyan-400" />
            <div className="text-left">
              <div className="text-white font-medium">Evaluate New Project</div>
              <div className="text-slate-400 text-sm">Get AI-powered analysis</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-slate-750 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all">
            <Target className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <div className="text-white font-medium">Find Opportunities</div>
              <div className="text-slate-400 text-sm">Discover funding matches</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-slate-750 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all">
            <FileText className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <div className="text-white font-medium">Generate Report</div>
              <div className="text-slate-400 text-sm">Download analysis</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

