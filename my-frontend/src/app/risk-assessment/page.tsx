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
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <RiskAssessment onShowProfile={() => setShowProfile(true)} setClientName={setClientName} />
      {showProfile && <RiskProfile clientName={clientName} />}
      {showProfile && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300"
            onClick={() => setShowDoctorModal(true)}
          >
            Add/Update Doctor Test Result
          </button>
        </div>
      )}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl font-bold"
              onClick={() => setShowDoctorModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Doctor Test Result Entry</h2>
            <DoctorTestResult patientId={clientName} />
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}