'use client';

import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Heart, Calendar, Shield, Stethoscope, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { useUser } from '../UserContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from './firebase';
import { setLocalPatients, getLocalPatients, Patient, Assessment } from './localDatabase';
import { useRouter } from 'next/navigation';

interface RiskAssessmentProps {
  onShowProfile: () => void;
  setClientName: (name: string) => void;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onShowProfile, setClientName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    patientNumber: '',
    phoneNumber: '',
    age: '',
    region: '',
    ageFirstSex: '',
    smoking: '',
    insurance: '',
    hivStatus: '',
    hpvTest: '',
    papSmear: '',
    stdsHistory: '',
    lastScreeningType: '',
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const riskProfileRef = typeof window !== 'undefined' ? document.getElementById('risk-profile') : null;
  const { user } = useUser();
  const db = getFirestore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [sectionError, setSectionError] = useState('');
  const router = useRouter();

  // Phone validation (Kenyan format)
  const isValidPhone = (phone: string) => {
    return /^((\+254|0)7\d{8})$/.test(phone);
  };

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

  const handleNextStep = () => {
    if (currentStep === 1 && !isStep1Valid) {
      setSectionError('Please fill in all required fields with valid information.');
      setTouched({
        patientNumber: true,
        phoneNumber: true,
        age: true,
        region: true,
      });
      return;
    }
    if (currentStep === 2 && !isStep2Valid) {
      setSectionError('Please fill in all required fields with valid information.');
      setTouched({
        ageFirstSex: true,
        smoking: true,
        insurance: true,
        hivStatus: true,
      });
      return;
    }
    setSectionError('');
    nextStep();
  };

  // Dummy recommendation data
  const recommendations = [
    {
      test: 'Pap Smear',
      frequency: 'Every 3 years',
      guideline: 'Pap smears are recommended for women aged 21-29 every 3 years.'
    },
    {
      test: 'HPV Test',
      frequency: 'Every 5 years',
      guideline: 'For women aged 30-65, co-testing with Pap smear and HPV test every 5 years is recommended.'
    },
    {
      test: 'Colposcopy',
      frequency: 'As needed',
      guideline: 'Recommended if abnormal results are found in Pap or HPV tests.'
    }
  ];

  const handleShowDashboard = async () => {
    setShowDashboard(true);
    const name = user?.displayName || user?.email || 'Client';
    setClientName(name);
    onShowProfile();
    setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    // Save to local database instead of Firestore
    try {
      const patients = getLocalPatients();
      // Check if patient already exists by patientNumber
      let patient = patients.find(p => p.id === formData.patientNumber);
      const newAssessment: Assessment = {
        id: `assess${Date.now()}`,
        date: new Date().toLocaleDateString(),
        result: (formData.hpvTest === 'Positive' || formData.papSmear === 'Positive') ? 'positive' : 'negative',
        notes: '',
      };
      if (patient) {
        // Add assessment to existing patient
        patient.assessments.push(newAssessment);
      } else {
        // Add new patient
        const newPatient: Patient = {
          id: formData.patientNumber,
          doctorId: user?.email || 'doc1',
          name: formData.patientNumber,
          age: Number(formData.age),
          region: formData.region,
          assessments: [newAssessment],
        };
        patients.push(newPatient);
      }
      setLocalPatients(patients);
      setSaveStatus('success');
      // Redirect to dashboard
      router.push('/doctor-dashboard');
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const handleGoToRiskProfile = () => {
    const el = document.getElementById('risk-profile');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const regionOptions = [
    'pumwani', 'kakamega', 'machakos', 'embu', 'mombasa', 'loitoktok', 'garisaa', 'kitale', 'moi', 'kericho'
  ];

  // Add this function for step 3 validation and warning
  const handleGetReport = () => {
    if (!isStep3Valid) {
      setSectionError('Please fill in all required fields with valid information.');
      setTouched(t => ({
        ...t,
        hpvTest: true,
        papSmear: true,
        stdsHistory: true,
        lastScreeningType: true,
      }));
      return;
    }
    setSectionError('');
    handleShowDashboard();
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
              <h3 className="text-2xl font-bold gradient-text mb-3">Patient Information</h3>
              <p className="text-gray-600">Please enter the patient's demographic and contact details.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-2">Patient ID</label>
                <input
                  type="text"
                  value={formData.patientNumber}
                  onChange={e => handleInputChange('patientNumber', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, patientNumber: true }))}
                  className={`w-full p-3 border rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 ${touched.patientNumber && !formData.patientNumber ? 'border-red-500' : ''}`}
                  placeholder="Enter Patient ID"
                  required
                />
                {touched.patientNumber && !formData.patientNumber && (
                  <p className="text-red-500 text-xs mt-1">Please fill this field.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-2">Patient Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => handleInputChange('phoneNumber', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, phoneNumber: true }))}
                  className={`w-full p-3 border rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 ${touched.phoneNumber && (!formData.phoneNumber || !isValidPhone(formData.phoneNumber)) ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                  required
                />
                {touched.phoneNumber && !formData.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">Please fill this field.</p>
                )}
                {touched.phoneNumber && formData.phoneNumber && !isValidPhone(formData.phoneNumber) && (
                  <p className="text-red-500 text-xs mt-1">Enter a valid Kenyan phone number (07XXXXXXXX or +2547XXXXXXXX)</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-2">Patient Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => handleInputChange('age', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, age: true }))}
                  className={`w-full p-3 border rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 ${touched.age && !formData.age ? 'border-red-500' : ''}`}
                  placeholder="Enter age"
                  required
                />
                {touched.age && !formData.age && (
                  <p className="text-red-500 text-xs mt-1">Please fill this field.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-pink-500 mb-2">Patient Region</label>
                <select
                  value={formData.region}
                  onChange={e => handleInputChange('region', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, region: true }))}
                  className={`w-full p-3 border rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 ${touched.region && !formData.region ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select region</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region.charAt(0).toUpperCase() + region.slice(1)}</option>
                  ))}
                </select>
                {touched.region && !formData.region && (
                  <p className="text-red-500 text-xs mt-1">Please fill this field.</p>
                )}
              </div>
            </div>
            {sectionError && (
              <div className="text-red-500 text-sm mt-4 text-center">{sectionError}</div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-200/50">
                <Heart className="w-8 h-8 text-purple-400 gentle-heartbeat" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Personal & Lifestyle</h3>
              <p className="text-gray-600">Provide relevant personal and lifestyle history for risk assessment.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">Age when you first had sex</label>
                <input
                  type="number"
                  value={formData.ageFirstSex}
                  onChange={e => handleInputChange('ageFirstSex', e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, ageFirstSex: true }))}
                  className={`w-full p-3 border rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 ${touched.ageFirstSex && !formData.ageFirstSex ? 'border-red-500' : ''}`}
                  placeholder="Enter age"
                  required
                />
                {touched.ageFirstSex && !formData.ageFirstSex && (
                  <p className="text-red-500 text-xs mt-1">Please fill this field.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">Do you smoke?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('smoking', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.smoking === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">Is your insurance covered?</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('insurance', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.insurance === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">HIV Status</label>
                <div className="flex gap-4">
                  {['Positive', 'Negative'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('hivStatus', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.hivStatus === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {sectionError && (
              <div className="text-red-500 text-sm mt-4 text-center">{sectionError}</div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-200/50">
                <Stethoscope className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Screening & Medical History</h3>
              <p className="text-gray-600">Document the patient's screening results and medical history.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">HPV Test Results</label>
                <div className="flex gap-4">
                  {['Positive', 'Negative', 'Never had one'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('hpvTest', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.hpvTest === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">Pap Smear Result</label>
                <div className="flex gap-4">
                  {['Positive', 'Negative', 'Never had one'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('papSmear', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.papSmear === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">STDs History</label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('stdsHistory', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.stdsHistory === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-500 mb-2">Last Screening Type</label>
                <div className="flex gap-4">
                  {['Pap smear', 'HPV DNA'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('lastScreeningType', option)}
                      className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.lastScreeningType === option ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50 text-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {sectionError && (
              <div className="text-red-500 text-sm mt-4 text-center">{sectionError}</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const isStep1Valid = formData.patientNumber && isValidPhone(formData.phoneNumber) && formData.age && formData.region;
  const isStep2Valid = formData.ageFirstSex && formData.smoking && formData.insurance && formData.hivStatus;
  const isStep3Valid = formData.hpvTest && formData.papSmear && formData.stdsHistory && formData.lastScreeningType;

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
            {!user ? (
              <div className="flex flex-col items-center justify-center h-full py-24">
                <h3 className="text-2xl font-bold text-pink-600 mb-4">Sign in to access your personalized report</h3>
                <p className="text-gray-600 mb-6">Please sign in or create an account to view and download your assessment results and risk profile dashboard.</p>
                <a href="/signup" className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300">Sign In / Create Account</a>
              </div>
            ) : showDashboard ? (
              <div ref={dashboardRef} className="mt-8">
                <h3 className="text-2xl font-bold mb-4 text-center text-pink-600">Personalized Screening Recommendations</h3>
                <div className="space-y-6 mb-8">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-6 rounded-xl border-2 border-pink-200 bg-white shadow-sm">
                      <div className="flex items-center gap-4 mb-2">
                        <Stethoscope className="w-6 h-6 text-purple-400" />
                        <span className="text-lg font-semibold text-gray-800">{rec.test}</span>
                        <span className="ml-auto px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">{rec.frequency}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{rec.guideline}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handleGoToRiskProfile}
                    className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    View Full Risk Profile & Download Report
                  </button>
                  <button
                    onClick={() => setShowDashboard(false)}
                    className="px-6 py-3 bg-white border-2 border-pink-300 text-pink-600 font-semibold rounded-full shadow hover:bg-pink-50 transition-all duration-300 flex items-center gap-2"
                  >
                    Back to Assessment
                  </button>
                </div>
                {showDashboard && saveStatus === 'success' && (
                  <div className="mb-6 text-green-600 text-center font-semibold">Assessment data saved successfully.</div>
                )}
                {showDashboard && saveStatus === 'error' && (
                  <div className="mb-6 text-red-600 text-center font-semibold">Error saving assessment data. Please try again.</div>
                )}
              </div>
            ) : (
              renderStep()
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || showDashboard}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                currentStep === 1 || showDashboard
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-gray-600 hover:text-pink-500 soft-button-outline'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            {currentStep === totalSteps && !showDashboard ? (
              <button
                className="group px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2"
                onClick={handleGetReport}
              >
                <Shield className="w-5 h-5 group-hover:animate-pulse" />
                Get Report
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
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