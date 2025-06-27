'use client';

import React from 'react';
import { FileText, MapPin, Syringe, Heart, ExternalLink, Download, Shield, Phone, Calendar, Users } from 'lucide-react';

const Resources = () => {
  const resources = [
       {
      icon: Calendar,
      title: 'Screening Reminders',
      description: 'Set up personalized reminders for your cervical cancer screening appointments',
      type: 'Tool',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      action: 'Set Reminders'
    },
 
      {
      icon: MapPin,
      title: 'Find Healthcare Providers',
      description: 'Locate certified screening centers and women\'s health specialists in your area',
      type: 'Interactive Tool',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: 'Find Providers'
    },

    {
        icon: Heart,
        title: 'Support Communities',
        description: 'Connect with support groups and communities for women\'s health and cervical cancer survivors',
        type: 'Community',
        color: 'text-pink-500',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        action: 'Join Community'
      },
    {
      icon: Phone,
      title: 'Helpline Support',
      description: '24/7 support hotline for questions about cervical health and screening',
      type: 'Support',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      action: 'Call Now'
    },
     {
      icon: FileText,
      title: 'WHO Guidelines',
      description: 'Comprehensive cervical cancer screening protocols and recommendations from the World Health Organization',
      type: 'External Link',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: 'Access Guidelines'
    },
    {
      icon: Syringe,
      title: 'HPV Vaccination Guide',
      description: 'Complete information about HPV vaccines, effectiveness, and vaccination schedules',
      type: 'PDF Download',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: 'Download Guide'
    },
  ];

  const educationalArticles = [
    {
      title: 'Understanding Cervical Cancer Risk Factors',
      description: 'Learn about the key factors that can increase your risk of developing cervical cancer',
      readTime: '5 min read',
      category: 'Prevention'
    },
    {
      title: 'HPV and Cervical Health: What You Need to Know',
      description: 'Comprehensive guide to human papillomavirus and its connection to cervical cancer',
      readTime: '7 min read',
      category: 'Education'
    },
    {
      title: 'Cervical Cancer Screening: Pap Tests vs HPV Tests',
      description: 'Understanding different screening methods and when each is recommended',
      readTime: '4 min read',
      category: 'Screening'
    },
    {
      title: 'Living with Abnormal Screening Results',
      description: 'What abnormal results mean and next steps for follow-up care',
      readTime: '6 min read',
      category: 'Support'
    }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-5 soft-grid"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <Heart className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-semibold text-pink-600 tracking-wide">HEALTH RESOURCES</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">Your Cervical Health</span>
            <span className="block gradient-text">Resource Hub</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Access trusted medical information, find healthcare providers, and connect with supportive communities 
            to take control of your cervical health journey with confidence.
          </p>
        </div>

        {/* Main Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <div key={index} className={`glass-card p-6 soft-hover border ${resource.borderColor}/30 h-full flex flex-col`}>
              <div className={`w-16 h-16 ${resource.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 border ${resource.borderColor}/50`}>
                <resource.icon className={`w-8 h-8 ${resource.color}`} />
              </div>
              
              <h3 className={`text-lg font-bold ${resource.color} mb-3 text-center`}>
                {resource.title}
              </h3>
              
              <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed text-center">
                {resource.description}
              </p>
              
              <div className="space-y-4 mt-auto">
                <div className={`text-xs font-semibold ${resource.color} bg-white/60 px-3 py-1 rounded-full text-center`}>
                  {resource.type}
                </div>
                
                <button className="w-full px-4 py-3  bg-pink-500  text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 flex items-center justify-center gap-2 group">
                  {resource.action}
                  {resource.type === 'External Link' ? (
                    <ExternalLink className="w-4 h-4 group-hover:animate-pulse" />
                  ) : resource.type === 'PDF Download' ? (
                    <Download className="w-4 h-4 group-hover:animate-bounce" />
                  ) : (
                    <resource.icon className="w-4 h-4 group-hover:animate-pulse" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Educational Articles */}
        <div className="glass-card p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Educational Articles
            </h3>
            <p className="text-gray-600">
              Stay informed with evidence-based articles written by medical professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationalArticles.map((article, index) => (
              <div key={index} className="glass-card-light p-6 soft-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        article.category === 'Prevention' ? 'text-green-600 bg-green-100' :
                        article.category === 'Education' ? 'text-blue-600 bg-blue-100' :
                        article.category === 'Screening' ? 'text-purple-600 bg-purple-100' :
                        'text-pink-600 bg-pink-100'
                      }`}>
                        {article.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      {article.title}
                    </h4>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {article.readTime}
                  </span>
                  <button className="text-pink-500 hover:text-pink-600 font-semibold text-sm flex items-center gap-2 group">
                    Read Article
                    <ExternalLink className="w-3 h-3 group-hover:animate-pulse" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-red-600">URGENT CARE</span>
            </div>
            
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Need Immediate Help?
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              If you're experiencing symptoms or have urgent concerns about your health, 
              don't wait. Contact your healthcare provider immediately.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                <Phone className="w-4 h-4" />
                Emergency Hotline
              </button>
              <button className="flex items-center gap-2 px-6 py-3 glass-card-light font-semibold text-gray-600 rounded-xl hover:bg-white/80 transition-all duration-300">
                <Users className="w-4 h-4" />
                Find Local Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;