import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

interface DoctorTestResultProps {
  patientId: string;
}

const testTypes = [
  'Pap smear',
  'HPV DNA',
  'Colposcopy',
  'Visual Inspection',
  'Other',
];

const DoctorTestResult: React.FC<DoctorTestResultProps> = ({ patientId }) => {
  const db = getFirestore();
  const [testType, setTestType] = useState('');
  const [testResult, setTestResult] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'testResults', patientId), {
        testType,
        testResult,
        date,
        notes,
        updatedAt: new Date(),
      });
      setSaveStatus('success');
    } catch (e) {
      setSaveStatus('error');
    }
  };

  return (
    <section className="max-w-2xl mx-auto mt-16 mb-16 p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
      <h3 className="text-2xl font-bold text-purple-600 mb-6 text-center">Doctor Test Result Entry</h3>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-purple-500 mb-2">Test Type</label>
          <select
            value={testType}
            onChange={e => setTestType(e.target.value)}
            className="w-full p-3 border rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
            required
          >
            <option value="">Select test type</option>
            {testTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-purple-500 mb-2">Test Result</label>
          <input
            type="text"
            value={testResult}
            onChange={e => setTestResult(e.target.value)}
            className="w-full p-3 border rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
            placeholder="Enter test result (e.g., Positive, Negative)"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-purple-500 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 border rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-purple-500 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 border rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300"
            placeholder="Additional notes (optional)"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full shadow hover:shadow-lg transition-all duration-300"
        >
          Save Test Result
        </button>
        {saveStatus === 'success' && (
          <div className="text-green-600 text-center font-semibold mt-2">Test result saved successfully.</div>
        )}
        {saveStatus === 'error' && (
          <div className="text-red-600 text-center font-semibold mt-2">Error saving test result. Please try again.</div>
        )}
      </form>
    </section>
  );
};

export default DoctorTestResult; 