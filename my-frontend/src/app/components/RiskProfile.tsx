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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-pink-200/50">
                <Calendar className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Basic Information</h3>
              <p className="text-gray-600">Help us understand your health background</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-3">What's your age range?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].map((age) => (
                    <button
                      key={age}
                      onClick={() => handleInputChange('age', age)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.age === age
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/50 text-gray-600'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-3">When was your last cervical screening?</label>
                <div className="space-y-3">
                  {[
                    'Within the last year',
                    '1-3 years ago',
                    '3-5 years ago',
                    'More than 5 years ago',
                    'Never had screening'
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('lastScreening', option)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.lastScreening === option
                          ? 'border-purple-400 bg-purple-50 text-purple-600'
                          : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.lastScreening === option
                            ? 'border-purple-400 bg-purple-400'
                            : 'border-gray-300'
                        }`}>
                          {formData.lastScreening === option && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200/50">
                <Heart className="w-8 h-8 text-rose-400 gentle-heartbeat" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Health History</h3>
              <p className="text-gray-600">Your family history helps us provide better care</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-rose-500 mb-3">Family history of cervical or other cancers?</label>
                <div className="space-y-3">
                  {[
                    'No family history',
                    'Cervical cancer in family',
                    'Other cancers in family',
                    'Multiple cancers in family',
                    'Not sure'
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('familyHistory', option)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.familyHistory === option
                          ? 'border-rose-400 bg-rose-50 text-rose-600'
                          : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.familyHistory === option
                            ? 'border-rose-400 bg-rose-400'
                            : 'border-gray-300'
                        }`}>
                          {formData.familyHistory === option && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-cyan-500 mb-3">Have you received the HPV vaccination?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Yes, fully vaccinated', 'Partially vaccinated', 'No vaccination'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('hpvVaccination', option)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.hpvVaccination === option
                          ? 'border-cyan-400 bg-cyan-50 text-cyan-600'
                          : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-200/50">
                <Stethoscope className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Lifestyle & Symptoms</h3>
              <p className="text-gray-600">Final questions to complete your health profile</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-3">Lifestyle factors (select all that apply)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Non-smoker',
                    'Current smoker',
                    'Former smoker',
                    'Regular exercise',
                    'Healthy diet',
                    'Stress management'
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const current = formData.lifestyle.split(',').filter(Boolean);
                        const updated = current.includes(option)
                          ? current.filter(item => item !== option)
                          : [...current, option];
                        handleInputChange('lifestyle', updated.join(','));
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.lifestyle.includes(option)
                          ? 'border-purple-400 bg-purple-50 text-purple-600'
                          : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 ${
                          formData.lifestyle.includes(option)
                            ? 'border-purple-400 bg-purple-400'
                            : 'border-gray-300'
                        }`}>
                          {formData.lifestyle.includes(option) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-3">Any concerning symptoms? (optional)</label>
                <div className="space-y-3">
                  {[
                    'No symptoms',
                    'Unusual bleeding',
                    'Pelvic pain',
                    'Unusual discharge',
                    'Pain during intimacy',
                    'Other concerns'
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('symptoms', option)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        formData.symptoms === option
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.symptoms === option
                            ? 'border-pink-400 bg-pink-400'
                            : 'border-gray-300'
                        }`}>
                          {formData.symptoms === option && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
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