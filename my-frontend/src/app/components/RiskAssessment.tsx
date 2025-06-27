'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Heart, Calendar, Shield, Stethoscope, ArrowRight, CheckCircle, Lock } from 'lucide-react';

const RiskAssessment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    lastScreening: '',
    familyHistory: '',
    lifestyle: '',
    symptoms: '',
    hpvVaccination: '',
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return null;
};

export default RiskAssessment; 