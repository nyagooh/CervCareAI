'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, Share, Filter, Search, Eye, FileText, Heart, Brain } from 'lucide-react';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const overviewStats = [
    {
      title: 'Total Assessments',
      value: '12,847',
      change: '+23%',
      trend: 'up',
      icon: Users,
      color: 'text-pink-500'
    },
    {
      title: 'Risk Predictions',
      value: '8,234',
      change: '+18%',
      trend: 'up',
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      title: 'Early Detections',
      value: '1,456',
      change: '+31%',
      trend: 'up',
      icon: Heart,
      color: 'text-rose-500'
    },
    {
      title: 'Lives Impacted',
      value: '15,692',
      change: '+27%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-cyan-500'
    }
  ];

  const recentReports = [
    {
      title: 'Monthly Cervical Health Report',
      date: 'December 2024',
      type: 'Monthly Summary',
      status: 'Ready',
      downloads: 1247
    },
    {
      title: 'AI Model Performance Analysis',
      date: 'November 2024',
      type: 'Technical Report',
      status: 'Ready',
      downloads: 892
    },
    {
      title: 'Global Health Impact Study',
      date: 'November 2024',
      type: 'Research Paper',
      status: 'Ready',
      downloads: 2156
    },
    {
      title: 'Risk Assessment Trends',
      date: 'October 2024',
      type: 'Analytics Report',
      status: 'Ready',
      downloads: 734
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 min-h-screen">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-5 soft-grid"></div>

      <div className="max-w-7xl mx-auto relative z-10 pt-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-600 tracking-wide">DATA INSIGHTS</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">Reports &</span>
            <span className="block gradient-text">Analytics Dashboard</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive insights into cervical health trends, AI model performance, 
            and the global impact of our early detection technology.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="glass-card p-2 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <div key={index} className="glass-card p-6 soft-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-${stat.color.split('-')[1]}-400/20 to-${stat.color.split('-')[1]}-500/20 flex items-center justify-center border border-${stat.color.split('-')[1]}-200/50`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold gradient-text mb-6">Assessment Trends Over Time</h3>
              <div className="h-64 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl flex items-center justify-center border border-pink-200/30">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive chart would be displayed here</p>
                  <p className="text-sm text-gray-400">Showing monthly assessment trends and outcomes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Search and Filter */}
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-pink-200/50 rounded-xl focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 glass-card-light rounded-xl font-semibold text-gray-600 hover:bg-white/80 transition-all duration-300">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="glass-card p-6 soft-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{report.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {report.downloads} downloads
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                        {report.status}
                      </span>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Model Accuracy</h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">94.2%</div>
                <p className="text-sm text-gray-500">Across all risk categories</p>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Early Detection Rate</h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">87.5%</div>
                <p className="text-sm text-gray-500">Cases identified before symptoms</p>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Global Reach</h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">23</div>
                <p className="text-sm text-gray-500">Countries served</p>
              </div>
            </div>

            {/* Analytics Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Risk Distribution</h3>
                <div className="h-48 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl flex items-center justify-center border border-pink-200/30">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-pink-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Pie chart showing risk levels</p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">Geographic Impact</h3>
                <div className="h-48 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl flex items-center justify-center border border-purple-200/30">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">World map with usage data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="mt-12 text-center">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold gradient-text mb-4">Export Data</h3>
            <p className="text-gray-600 mb-6">Download comprehensive reports and analytics data</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
              <button className="flex items-center gap-2 px-6 py-3 glass-card-light font-semibold text-gray-600 rounded-xl hover:bg-white/80 transition-all duration-300">
                <Share className="w-4 h-4" />
                Share Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportsAnalytics;