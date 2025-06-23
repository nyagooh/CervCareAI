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
     
    </section>
  );
};

export default HowItWorks;