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

  return (
    <section id="risk-assessment" className="py-20 px-6 relative bg-gradient-to-br from-purple-50 via-rose-50 to-pink-50">
      {/* Soft Background Pattern */}
      <div className="absolute inset-0 opacity-5 soft-grid"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 hidden lg:block">
        <div className="w-6 h-6 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-30 gentle-float">
          <Heart className="w-3 h-3 text-white m-1.5" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:block">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-300 to-cyan-300 rounded-full opacity-30 gentle-float" style={{ animationDelay: '-1s' }}>
          <Shield className="w-4 h-4 text-white m-2" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card-light px-6 py-3 mb-8">
            <Heart className="w-5 h-5 text-pink-400 gentle-heartbeat" />
            <span className="text-sm font-semibold text-pink-600 tracking-wide">PERSONALIZED ASSESSMENT</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="block text-gray-800">Your Gentle</span>
            <span className="block gradient-text">Health Assessment</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Take a few minutes to share your health story with us. This gentle assessment 
            helps us provide personalized care recommendations just for you.
          </p>
        </div>

        {/* Assessment Form */}
        <div className="glass-card p-8 md:p-12 relative">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-pink-500">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-semibold text-purple-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="soft-progress h-3 rounded-full">
              <div 
                className="soft-progress-fill h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="min-h-[500px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-gray-600 hover:text-pink-500 soft-button-outline'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === totalSteps ? (
              <button className="group px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2">
                <Shield className="w-5 h-5 group-hover:animate-pulse" />
                Get My Health Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="group px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="glass-card-light p-6 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-500" />
                <span>Your data is completely secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>HIPAA compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Designed with care</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supportive Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            ✨ Remember, this assessment is a tool to help guide your health journey. 
            Always consult with your healthcare provider for medical advice and care.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RiskAssessment; 