'use client';
import Navbar from '../components/Navbar'
import RiskAssessment from '../components/Risk-Assessment'
import RiskProfile from '../components/RiskProfile'
import Footer from '../components/footer'
import React, { useState } from 'react';

export default function RiskAssessmentPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [clientName, setClientName] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <RiskAssessment onShowProfile={() => setShowProfile(true)} setClientName={setClientName} />
      {showProfile && <RiskProfile clientName={clientName} />}
      <Footer />
    </div>
  )
}