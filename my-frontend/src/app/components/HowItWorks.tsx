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

};

export default HowItWorks;