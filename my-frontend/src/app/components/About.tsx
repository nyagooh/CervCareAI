'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Heart, Shield, Sparkles, ArrowRight, Stethoscope, Activity } from 'lucide-react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('cervical-ai-info');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Smart Analysis',
      description: 'AI examines your health patterns with gentle precision, identifying risks early when treatment is most effective.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Every woman is unique. Our AI creates tailored health recommendations based on your individual profile.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      icon: Shield,
      title: 'Preventive Protection',
      description: 'Proactive health monitoring helps prevent cervical cancer through early detection and lifestyle guidance.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    }
  ];

  return (
    <section id="cervical-ai-info" className="py-20 px-6 relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Soft Grid Background */}
      <div className="absolute inset-0 opacity-10 soft-grid"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-semibold text-pink-600 tracking-wide">INTELLIGENT HEALTHCARE</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">How AI Enhances</span>
            <span className="block gradient-text">Cervical Health Care</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our gentle AI technology combines medical expertise with compassionate care, 
            helping women take control of their cervical health through early detection and personalized guidance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: AI Healthcare Professional */}
          <div className="space-y-6">
            <div className="glass-card p-6 soft-hover">
              <div className="relative mb-6 group">
                <img 
                  src="/reproductive-system-stethoscope-flat-lay.jpg" 
                  alt="AI-powered medical technology for women's health" 
                  className="w-full h-64 object-cover rounded-2xl"
                />
                
                {/* Gentle AI Indicators */}
                <div className="absolute top-4 left-4 glass-card-light p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">AI Active</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 glass-card-light p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400 gentle-float" />
                    <span className="text-sm font-medium text-gray-700">Analyzing</span>
                  </div>
                </div>

                {/* Soft scanning effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent animate-pulse"></div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  AI-Powered Health Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Advanced technology working gently to protect your health
                </p>
              </div>
            </div>

            {/* Health Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center soft-hover">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-200/50">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">94%</div>
                <div className="text-xs text-gray-500">Accuracy Rate</div>
              </div>
              
              <div className="glass-card p-4 text-center soft-hover">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-pink-200/50">
                  <Heart className="w-6 h-6 text-pink-400 gentle-heartbeat" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">24/7</div>
                <div className="text-xs text-gray-500">Care Support</div>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`glass-card p-6 soft-hover border ${feature.borderColor}/30`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center border ${feature.borderColor}/50`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`text-lg font-bold ${feature.color} mb-2`}>
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Experience Gentle AI Care
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Let our compassionate AI technology help you take the first step 
              towards better cervical health with personalized, gentle guidance.
            </p>
            
            <button className="group px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2 mx-auto">
              <Stethoscope className="w-5 h-5 group-hover:animate-pulse" />
              Start Your Assessment Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-8 hidden xl:block">
        <div className="w-6 h-6 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-40 gentle-float">
          <Heart className="w-3 h-3 text-white m-1.5" />
        </div>
      </div>
      
      <div className="absolute bottom-20 right-8 hidden xl:block">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-300 to-cyan-300 rounded-full opacity-40 gentle-float" style={{ animationDelay: '-1s' }}>
          <Sparkles className="w-4 h-4 text-white m-2" />
        </div>
      </div>
    </section>
  );
};

export default About;