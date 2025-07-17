'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import dynamic from 'next/dynamic';
import { Calendar, FileText, BarChart3, Users, Heart, Stethoscope, X } from 'lucide-react';
import { doctors, patients as initialPatients, Doctor, Patient, Assessment } from './localDatabase';
const DoctorCharts = dynamic(() => import('./DoctorCharts'), { ssr: false });

const COLORS = ['#ec4899', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#38bdf8'];

const DoctorDashboard = () => {
  const { user } = useUser();
  // Find the current doctor (for demo, match by email)
  const doctor = doctors.find(d => d.email === user?.email) || doctors[0];
  // State for patients (filtered by doctor)
  const [patientList, setPatientList] = useState<Patient[]>(() => initialPatients.filter(p => p.doctorId === doctor.id));
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', region: '' });

  // Flatten all assessments for analytics
  const assessments = patientList.flatMap(p => p.assessments.map(a => ({ ...a, patientName: p.name, age: p.age, region: p.region })));

  // Analytics data
  const positiveCount = assessments.filter(a => a.result === 'positive').length;
  const negativeCount = assessments.filter(a => a.result === 'negative').length;
  const regionCounts: Record<string, number> = {};
  assessments.forEach(a => {
    if (a.region) {
      if (!regionCounts[a.region]) regionCounts[a.region] = 0;
      regionCounts[a.region]++;
    }
  });
  const regionData = Object.keys(regionCounts).map(region => ({ name: region, value: regionCounts[region] }));

  // Assessments over time (by date)
  const dateCounts: Record<string, number> = {};
  assessments.forEach(a => {
    let dateStr = a.date;
    if (dateStr) {
      if (!dateCounts[dateStr]) dateCounts[dateStr] = 0;
      dateCounts[dateStr]++;
    }
  });
  const dateData = Object.keys(dateCounts).map(date => ({ date, count: dateCounts[date] }));

  if (!user) {
    return <></>;
  }

  // Add new patient handler
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.region) return;
    const newPat: Patient = {
      id: `pat${Date.now()}`,
      doctorId: doctor.id,
      name: newPatient.name,
      age: Number(newPatient.age),
      region: newPatient.region,
      assessments: [],
    };
    setPatientList(prev => [...prev, newPat]);
    setShowAddPatient(false);
    setNewPatient({ name: '', age: '', region: '' });
  };

  return (
    <section className="py-20 px-6 relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 min-h-screen">
      <div className="max-w-6xl mx-auto relative z-10 pt-8">
        {/* Doctor Profile */}
        <div className="flex items-center gap-6 mb-10 bg-white rounded-2xl shadow p-6 border border-pink-100">
          <img
            src={user.photoURL || '/defaultpic.jpg'}
            alt="Doctor profile"
            className="w-20 h-20 rounded-full border-2 border-pink-400 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-pink-600">{user.displayName || doctor.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">Doctor</span>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 flex flex-col items-center">
            <Users className="w-8 h-8 text-pink-400 mb-2" />
            <div className="text-2xl font-bold">{assessments.length}</div>
            <div className="text-gray-600">Total Assessments</div>
          </div>
          <div className="glass-card p-6 flex flex-col items-center">
            <FileText className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{positiveCount}</div>
            <div className="text-gray-600">Positive Results</div>
          </div>
          <div className="glass-card p-6 flex flex-col items-center">
            <Heart className="w-8 h-8 text-rose-400 mb-2" />
            <div className="text-2xl font-bold">{negativeCount}</div>
            <div className="text-gray-600">Negative Results</div>
          </div>
        </div>
        <DoctorCharts regionData={regionData} dateData={dateData} />

        {/* Add Patient Button */}
        <div className="mb-6 flex justify-end">
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => setShowAddPatient(true)}>
            + Add Patient
          </button>
        </div>

        {/* Add Patient Modal */}
        {showAddPatient && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500" onClick={() => setShowAddPatient(false)}><X /></button>
              <h3 className="text-xl font-bold mb-4 text-pink-600">Add New Patient</h3>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2" value={newPatient.name} onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))} required />
                <input type="number" placeholder="Age" className="w-full border rounded px-3 py-2" value={newPatient.age} onChange={e => setNewPatient(p => ({ ...p, age: e.target.value }))} required />
                <input type="text" placeholder="Region" className="w-full border rounded px-3 py-2" value={newPatient.region} onChange={e => setNewPatient(p => ({ ...p, region: e.target.value }))} required />
                <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold w-full">Add Patient</button>
              </form>
            </div>
          </div>
        )}

        {/* Patient List */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 gradient-text">Patients Who Have Done Tests</h2>
          {patientList.length === 0 ? (
            <div className="text-center text-gray-500">No patients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Patient Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Age</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Region</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Assessments</th>
                  </tr>
                </thead>
                <tbody>
                  {patientList.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-pink-50 cursor-pointer" onClick={() => { setSelectedPatient(p); setShowPatientModal(true); }}>
                      <td className="px-4 py-2 text-sm font-semibold text-pink-700">{p.name}</td>
                      <td className="px-4 py-2 text-sm">{p.age}</td>
                      <td className="px-4 py-2 text-sm capitalize">{p.region}</td>
                      <td className="px-4 py-2 text-sm">{p.assessments.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Patient History Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-pink-500" onClick={() => setShowPatientModal(false)}><X /></button>
              <h3 className="text-xl font-bold mb-4 text-pink-600">{selectedPatient.name}'s Assessment History</h3>
              {selectedPatient.assessments.length === 0 ? (
                <div className="text-gray-500">No assessments found.</div>
              ) : (
                <table className="min-w-full divide-y divide-pink-100">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Result</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.assessments.map((a, idx) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2 text-sm">{a.date}</td>
                        <td className={`px-4 py-2 text-sm font-semibold ${a.result === 'positive' ? 'text-rose-600' : 'text-green-600'}`}>{a.result}</td>
                        <td className="px-4 py-2 text-sm">{a.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDashboard; 