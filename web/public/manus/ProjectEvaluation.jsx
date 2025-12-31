import React, { useState } from 'react';
import { Zap, Upload, DollarSign, Users, Calendar, Tag, Target, Sparkles } from 'lucide-react';

export function ProjectEvaluation({ user }) {
  const [formData, setFormData] = useState({
    project_title: '',
    description: '',
    budget: '',
    duration_months: '12',
    category: '',
    team_size: '1',
    keywords: '',
    target_audience: '',
    innovation_level: 'incremental'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const categories = [
    'Technology',
    'Healthcare',
    'Environment',
    'Education',
    'Agriculture',
    'Energy',
    'Social Impact',
    'Research',
    'Arts & Culture',
    'Other'
  ];

  const innovationLevels = [
    { value: 'incremental', label: 'Incremental Improvement' },
    { value: 'significant', label: 'Significant Innovation' },
    { value: 'breakthrough', label: 'Breakthrough Technology' },
    { value: 'disruptive', label: 'Disruptive Innovation' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        project_id: 'proj_' + Date.now(),
        overall_score: 78.4 + Math.random() * 20,
        funding_probability: 0.73 + Math.random() * 0.25,
        confidence_level: 0.89,
        risk_assessment: 'medium',
        processing_time_ms: 2847,
        detailed_scores: {
          technical_feasibility: 82.1,
          market_potential: 76.8,
          team_capability: 79.3,
          financial_viability: 74.2,
          innovation_factor: 85.6,
          social_impact: 71.9
        },
        insights: {
          strengths: [
            'Strong technical foundation with proven methodologies',
            'Clear market demand and target audience identification',
            'Experienced team with relevant domain expertise'
          ],
          areas_for_improvement: [
            'Consider expanding partnership network for broader reach',
            'Develop more detailed risk mitigation strategies',
            'Strengthen financial projections with market validation'
          ],
          strategic_recommendations: [
            'Focus on pilot program with key stakeholders',
            'Develop intellectual property protection strategy',
            'Create detailed go-to-market timeline'
          ]
        },
        benchmarks: {
          similar_projects_funded: 127,
          average_funding_amount: 850000,
          success_rate_category: 0.68,
          percentile_ranking: 78
        }
      };

      setResult(mockResult);
      setLoading(false);
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Results</h1>
            <p className="text-slate-400">AI-powered analysis powered by Abasensor™</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            New Evaluation
          </button>
        </div>

        {/* Overall Score */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-semibold text-white">Overall Assessment</span>
            </div>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overall_score)}`}>
              {result.overall_score.toFixed(1)}%
            </div>
            <div className="text-slate-400 mb-4">Funding Readiness Score</div>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div>
                <span className="text-slate-400">Funding Probability: </span>
                <span className="text-green-400 font-semibold">
                  {Math.round(result.funding_probability * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400">Confidence: </span>
                <span className="text-cyan-400 font-semibold">
                  {Math.round(result.confidence_level * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400">Processed in: </span>
                <span className="text-blue-400 font-semibold">
                  {(result.processing_time_ms / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result.detailed_scores).map(([key, score]) => (
              <div key={key} className="bg-slate-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm capitalize">
                    {key.replace('_', ' ')}
                  </span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>
                    {score.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${getScoreGradient(score)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-4">Strengths</h4>
            <ul className="space-y-2">
              {result.insights.strengths.map((strength, index) => (
                <li key={index} className="text-slate-300 text-sm flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Areas for Improvement</h4>
            <ul className="space-y-2">
              {result.insights.areas_for_improvement.map((area, index) => (
                <li key={index} className="text-slate-300 text-sm flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Strategic Recommendations</h4>
            <ul className="space-y-2">
              {result.insights.strategic_recommendations.map((rec, index) => (
                <li key={index} className="text-slate-300 text-sm flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Market Benchmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{result.benchmarks.similar_projects_funded}</div>
              <div className="text-slate-400 text-sm">Similar Projects Funded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${(result.benchmarks.average_funding_amount / 1000000).toFixed(1)}M
              </div>
              <div className="text-slate-400 text-sm">Average Funding Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(result.benchmarks.success_rate_category * 100)}%
              </div>
              <div className="text-slate-400 text-sm">Category Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {result.benchmarks.percentile_ranking}th
              </div>
              <div className="text-slate-400 text-sm">Percentile Ranking</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Project Evaluation</h1>
        <p className="text-slate-400">
          Get AI-powered funding analysis powered by Abasensor™ technology
        </p>
      </div>

      {/* Usage Stats */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">Monthly Usage</span>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">
              {user.subscription.monthly_evaluations_used} / {user.subscription.monthly_evaluations_limit}
            </div>
            <div className="text-slate-400 text-sm">evaluations remaining</div>
          </div>
        </div>
      </div>

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="project_title"
                value={formData.project_title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter your project title"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Describe your project, its objectives, methodology, and expected outcomes..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Budget (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="500000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duration (Months)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Team Size
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="number"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="artificial intelligence, machine learning, climate change"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Audience
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Government agencies, researchers, NGOs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Innovation Level
              </label>
              <select
                name="innovation_level"
                value={formData.innovation_level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-750 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {innovationLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing with Abasensor™...
              </div>
            ) : (
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Evaluate Project
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

