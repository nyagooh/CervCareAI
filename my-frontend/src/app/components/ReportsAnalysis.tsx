'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Shield, Calendar, TrendingDown, TrendingUp, CheckCircle, AlertCircle, Info, Download, Share, Stethoscope, ArrowRight, Sparkles } from 'lucide-react';

const RiskProfile = () => {
  const [riskScore, setRiskScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const targetRiskScore = 28; // Low risk example
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('risk-profile');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setRiskScore(prev => {
            if (prev >= targetRiskScore) {
              clearInterval(interval);
              return targetRiskScore;
            }
            return prev + 1;
          });
        }, 50);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, targetRiskScore]);

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { 
      level: 'Low Risk', 
      color: 'text-green-500', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Your risk profile looks reassuring',
      icon: CheckCircle
    };
    if (score <= 60) return { 
      level: 'Moderate Risk', 
      color: 'text-yellow-500', 
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      message: 'Some factors need gentle attention',
      icon: AlertCircle
    };
    return { 
      level: 'Higher Risk', 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      message: 'Let\'s work together on your health',
      icon: AlertCircle
    };
  };

  const riskInfo = getRiskLevel(riskScore);
  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  const insights = [
    {
      icon: CheckCircle,
      title: 'Age Factor',
      description: 'Your age group shows favorable baseline risk patterns',
      impact: 'Protective',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Shield,
      title: 'Screening History',
      description: 'Regular screening significantly reduces your risk profile',
      impact: 'Very Protective',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Heart,
      title: 'Lifestyle Factors',
      description: 'Some lifestyle choices may benefit from gentle adjustments',
      impact: 'Moderate',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  const recommendations = [
    {
      title: 'Continue Regular Screening',
      description: 'Keep up with your current screening schedule every 3 years',
      priority: 'high',
      color: 'text-pink-500',
      icon: Calendar
    },
    {
      title: 'HPV Vaccination Discussion',
      description: 'Consider discussing HPV vaccination options with your healthcare provider',
      priority: 'medium',
      color: 'text-purple-500',
      icon: Shield
    },
    {
      title: 'Gentle Lifestyle Support',
      description: 'Small, sustainable changes to support your immune system and overall health',
      priority: 'medium',
      color: 'text-cyan-500',
      icon: Heart
    }
  ];

  return (
    <section id="risk-profile" className="py-20 px-6 relative bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-5 soft-grid"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="w-6 h-6 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-30 gentle-float">
          <Heart className="w-3 h-3 text-white m-1.5" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-300 to-cyan-300 rounded-full opacity-30 gentle-float" style={{ animationDelay: '-1s' }}>
          <Sparkles className="w-4 h-4 text-white m-2" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <Heart className="w-5 h-5 text-pink-400 gentle-heartbeat" />
            <span className="text-sm font-semibold text-pink-600 tracking-wide">YOUR PERSONALIZED RESULTS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">Your Cervical Health</span>
            <span className="block gradient-text">Risk Profile</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Based on your health information, our gentle AI has created a personalized assessment 
            to help guide your cervical health journey with care and understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Risk Score Visualization */}
          <div className="glass-card p-8 text-center soft-hover relative">
            <h3 className="text-2xl font-bold gradient-text mb-8">Your Risk Assessment</h3>
            
            <div className="relative w-72 h-72 mx-auto mb-8">
              <svg className="transform -rotate-90 w-72 h-72">
                {/* Background Circle */}
                <circle
                  cx="144"
                  cy="144"
                  r="80"
                  stroke="rgba(236, 72, 153, 0.1)"
                  strokeWidth="16"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="144"
                  cy="144"
                  r="80"
                  stroke="url(#riskGradient)"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 2s ease-in-out',
                  }}
                />
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold gradient-text mb-2">{riskScore}%</div>
                <div className={`text-lg font-semibold ${riskInfo.color} mb-1`}>
                  {riskInfo.level}
                </div>
                <div className="text-sm text-gray-500 text-center max-w-32">
                  {riskInfo.message}
                </div>
              </div>
            </div>

            {/* Risk Scale */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-green-500">Low (0-30%)</span>
                <span className="text-yellow-500">Moderate (31-60%)</span>
                <span className="text-orange-500">Higher (61-100%)</span>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200 rounded-full relative">
                <div 
                  className="absolute top-0 w-3 h-3 bg-white border-2 border-pink-400 rounded-full transform -translate-y-0.5 transition-all duration-2s"
                  style={{ left: `${riskScore}%`, transform: 'translateX(-50%) translateY(-25%)' }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 glass-card-light px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-pink-600 hover:bg-pink-50 transition-all duration-300">
                <Download className="w-4 h-4" />
                Download Report
              </button>
              <button className="flex-1 soft-button text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Share className="w-4 h-4" />
                Share Results
              </button>
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="space-y-6">
            {/* Health Insights */}
            <div className="glass-card p-6 soft-hover">
              <h3 className="text-xl font-bold gradient-text mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-purple-400" />
                Your Health Insights
              </h3>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 ${insight.bgColor} rounded-xl border ${insight.borderColor}/50`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 bg-white rounded-full flex items-center justify-center border ${insight.borderColor}`}>
                        <insight.icon className={`w-4 h-4 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${insight.color} text-sm mb-1`}>
                          {insight.title}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{insight.description}</div>
                        <div className={`text-xs font-semibold ${insight.color}`}>
                          Impact: {insight.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gentle Recommendations */}
            <div className="glass-card p-6 soft-hover">
              <h3 className="text-xl font-bold gradient-text mb-6">
                Gentle Care Recommendations
              </h3>
              
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 glass-card-light rounded-xl soft-hover">
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        rec.priority === 'high' ? 'bg-pink-100 border border-pink-200' : 'bg-purple-100 border border-purple-200'
                      }`}>
                        <rec.icon className={`w-3 h-3 ${rec.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${rec.color} text-sm mb-1`}>
                          {rec.title}
                        </div>
                        <div className="text-sm text-gray-600">{rec.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Healthcare Provider Connection */}
        <div className="mt-16">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-4">
                  Connect with Care
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Your health journey is unique, and we're here to support you every step of the way. 
                  Connect with healthcare providers who understand and care about your cervical health.
                </p>
                
                <button className="group px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 group-hover:animate-pulse" />
                  Find Healthcare Providers
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="glass-card-light p-6 rounded-2xl">
                <img 
                  src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400" 
                  alt="Supportive healthcare consultation" 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-1">Expert Support Available</div>
                  <div className="text-xs text-gray-500">Compassionate care when you need it</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gentle Disclaimer */}
        <div className="mt-16 text-center">
          <div className="glass-card-light p-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-sm font-semibold text-pink-600">Important Health Information</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This assessment is designed to support your health journey and provide educational information. 
              It does not replace professional medical advice, diagnosis, or treatment. Please consult with 
              your healthcare provider for personalized medical guidance and care decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskProfile;