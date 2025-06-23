'use client';

import React, { useEffect, useState } from 'react';
import { Heart, FileText, Brain, Sparkles, ArrowRight, Shield, Stethoscope, Users, Calendar, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
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

    const element = document.getElementById('how-it-works');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: FileText,
      title: 'Share Your Story',
      description: 'Complete a gentle health questionnaire about your medical history, lifestyle, and concerns in a safe, private space.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      glowColor: 'shadow-pink-200/50'
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Our compassionate AI carefully analyzes your information using the latest cervical cancer research and medical guidelines.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      glowColor: 'shadow-purple-200/50'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Receive your personalized risk assessment with gentle recommendations for screening, lifestyle, and next steps.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      glowColor: 'shadow-rose-200/50'
    },
    {
      icon: Stethoscope,
      title: 'Connect with Care',
      description: 'Get connected with healthcare providers, support resources, and ongoing guidance tailored to your unique needs.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      glowColor: 'shadow-cyan-200/50'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Early Detection',
      description: 'Identify potential risks before symptoms appear'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Connect with healthcare professionals who care'
    },
    {
      icon: Calendar,
      title: 'Ongoing Care',
      description: 'Regular check-ins and health monitoring'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-5 soft-grid"></div>
      
      {/* Floating Health Elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="w-8 h-8 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-30 gentle-float flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-30 gentle-float flex items-center justify-center" style={{ animationDelay: '-1s' }}>
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <Heart className="w-5 h-5 text-pink-400 gentle-heartbeat" />
            <span className="text-sm font-semibold text-pink-600 tracking-wide">YOUR HEALTH JOURNEY</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">How We Support</span>
            <span className="block gradient-text">Your Cervical Health</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our gentle, step-by-step process combines advanced AI technology with compassionate care 
            to help you understand and protect your cervical health with confidence and peace of mind.
          </p>
        </div>

        {/* Steps Process */}
        <div className="relative mb-16">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`glass-card p-6 text-center soft-hover border ${step.borderColor}/30 relative group`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 border ${step.borderColor}/50 group-hover:${step.glowColor} transition-all duration-300`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className={`text-lg font-bold ${step.color} mb-3`}>
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-6 h-6 text-pink-300 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="glass-card p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Why Choose Our Approach?
            </h3>
            <p className="text-gray-600">
              Designed by women, for women - with empathy and expertise at every step
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center glass-card-light p-6 soft-hover">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-pink-200/50">
                  <benefit.icon className="w-6 h-6 text-pink-400" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Healthcare Professional Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h3 className="text-3xl font-bold gradient-text mb-6">
              Trusted by Healthcare Professionals
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our AI system is developed in collaboration with gynecologists, oncologists, 
              and women's health experts to ensure the highest standards of care and accuracy.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Evidence-based medical guidelines</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Continuous learning from latest research</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Privacy-first approach to your data</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 soft-hover">
            <img 
              src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Healthcare professional discussing cervical health" 
              className="w-full h-80 object-cover rounded-2xl"
            />
            
            {/* Floating Care Indicators */}
            <div className="absolute top-8 right-8 glass-card-light p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Expert Care</span>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-8 glass-card-light p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400 gentle-heartbeat" />
                <span className="text-sm font-medium text-gray-700">Compassionate Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              Ready to Take the First Step?
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Join thousands of women who have taken control of their cervical health 
              with our gentle, AI-powered assessment.
            </p>
            
            <button className="group px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2 mx-auto">
              <Heart className="w-5 h-5 group-hover:animate-pulse" />
              Begin Your Health Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              ✨ Free assessment • 5 minutes • Completely confidential
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;