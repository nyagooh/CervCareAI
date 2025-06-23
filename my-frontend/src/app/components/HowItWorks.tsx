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

};

export default HowItWorks;