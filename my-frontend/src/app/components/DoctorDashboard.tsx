'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '../UserContext';
import { Calendar, FileText, BarChart3, Users, Heart, Stethoscope, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ec4899', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#38bdf8'];

const DoctorDashboard = () => {
  const { user, role } = useUser();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;
      setLoading(true);
      const db = getFirestore();
      const doctorName = user.displayName || user.email || 'Client';
      const q = query(collection(db, 'assessments'), where('doctor', '==', doctorName));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssessments(data);
      setLoading(false);
    };
    fetchAssessments();
  }, [user]);

  // Group assessments by patientNumber
  const patients = {};
  assessments.forEach(a => {
    if (!patients[a.patientNumber]) patients[a.patientNumber] = [];
    patients[a.patientNumber].push(a);
  });
  const patientList = Object.keys(patients).map(pid => ({
    patientNumber: pid,
    phoneNumber: patients[pid][0]?.phoneNumber,
    age: patients[pid][0]?.age,
    region: patients[pid][0]?.region,
    assessments: patients[pid],
  }));

  // Analytics data
  const positiveCount = assessments.filter(a => a.hpvTest === 'Positive' || a.papSmear === 'Positive').length;
  const negativeCount = assessments.filter(a => a.hpvTest === 'Negative' && a.papSmear === 'Negative').length;
  const regionCounts = {};
  assessments.forEach(a => {
    if (!regionCounts[a.region]) regionCounts[a.region] = 0;
    regionCounts[a.region]++;
  });
  const regionData = Object.keys(regionCounts).map(region => ({ name: region, value: regionCounts[region] }));

  // Assessments over time (by date)
  const dateCounts = {};
  assessments.forEach(a => {
    let dateStr = '';
    if (a.createdAt?.toDate) {
      dateStr = a.createdAt.toDate().toLocaleDateString();
    } else if (a.createdAt) {
      dateStr = new Date(a.createdAt).toLocaleDateString();
    }
    if (!dateCounts[dateStr]) dateCounts[dateStr] = 0;
    dateCounts[dateStr]++;
  });
  const dateData = Object.keys(dateCounts).map(date => ({ date, count: dateCounts[date] }));

  if (!user || role !== 'doctor') {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg border border-pink-100 text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Doctor Dashboard</h2>
        <p className="text-gray-600">You must be signed in as a doctor to view this dashboard.</p>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-pink-600">{user.displayName || 'Doctor'}</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 gradient-text">Results by Region</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 gradient-text">Assessments Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient List */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 gradient-text">Patients Who Have Done Tests</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading patients...</div>
          ) : patientList.length === 0 ? (
            <div className="text-center text-gray-500">No patients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Patient ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Age</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Region</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Assessments</th>
                  </tr>
                </thead>
                <tbody>
                  {patientList.map((p, idx) => (
                    <tr key={p.patientNumber || idx} className="hover:bg-pink-50 cursor-pointer" onClick={() => { setSelectedPatient(p); setShowPatientModal(true); }}>
                      <td className="px-4 py-2 text-sm font-semibold text-pink-700">{p.patientNumber}</td>
                      <td className="px-4 py-2 text-sm">{p.phoneNumber}</td>
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
              <button className="absolute top-4 right-4 text-gray-400 hover:text-pink-500" onClick={() => setShowPatientModal(false)}>
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center gradient-text">Patient History: {selectedPatient.patientNumber}</h3>
              <div className="mb-4 text-center text-gray-600">Phone: {selectedPatient.phoneNumber} | Age: {selectedPatient.age} | Region: {selectedPatient.region}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-pink-100">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">HPV Test</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Pap Smear</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">STDs History</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-pink-600">Last Screening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPatient.assessments.map((a, idx) => (
                      <tr key={a.id || idx} className="hover:bg-pink-50">
                        <td className="px-4 py-2 text-sm">{a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : ''}</td>
                        <td className="px-4 py-2 text-sm">{a.hpvTest}</td>
                        <td className="px-4 py-2 text-sm">{a.papSmear}</td>
                        <td className="px-4 py-2 text-sm">{a.stdsHistory}</td>
                        <td className="px-4 py-2 text-sm">{a.lastScreeningType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6 gradient-text">Insights</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Total Assessments: <span className="font-semibold text-pink-600">{assessments.length}</span></li>
            <li>Positive Results: <span className="font-semibold text-purple-600">{positiveCount}</span></li>
            <li>Negative Results: <span className="font-semibold text-rose-600">{negativeCount}</span></li>
            <li>Regions Covered: <span className="font-semibold text-cyan-600">{regionData.length}</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DoctorDashboard; 