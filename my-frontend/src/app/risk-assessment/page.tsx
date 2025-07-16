'use client';
import Navbar from '../components/Navbar'
import RiskAssessment from '../components/Risk-Assessment'
import RiskProfile from '../components/RiskProfile'
import Footer from '../components/footer'
import React, { useState } from 'react';
import DoctorTestResult from '../components/DoctorTestResult';

export default function RiskAssessmentPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [clientName, setClientName] = useState('');
  const [showDoctorForm, setShowDoctorForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <RiskAssessment onShowProfile={() => setShowProfile(true)} setClientName={setClientName} />
      {showProfile && <RiskProfile clientName={clientName} />}
      {showProfile && (
        <div className="flex flex-col items-center mt-8">
          <button
            className="mb-4 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300"
            onClick={() => setShowDoctorForm((v) => !v)}
          >
            Add/Update Doctor Test Result
          </button>
          {showDoctorForm && (
            <div className="w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Doctor Test Result Entry</h2>
              <DoctorTestResult patientId={clientName} />
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  )
}