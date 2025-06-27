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
  

  return (
    <section id="risk-profile" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">Risk Profile Section</div>
    </section>
  );
};

export default RiskProfile;
