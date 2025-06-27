'use client';

import React, { useState, useEffect } from 'react';

const RiskProfile = () => {
  const [riskScore, setRiskScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
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
  const targetRiskScore = 28;

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
}, [isVisible]);
const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low Risk', ... };
    if (score <= 60) return { level: 'Moderate Risk', ... };
    return { level: 'Higher Risk', ... };
  };
  
  const riskInfo = getRiskLevel(riskScore);
  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;
  

  return (
    <section id="risk-profile" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">Risk Profile Section</div>
    </section>
  );
};

export default RiskProfile;
