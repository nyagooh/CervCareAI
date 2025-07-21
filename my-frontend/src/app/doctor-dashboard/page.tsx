'use client';
import Navbar from '../components/Navbar';
import DoctorDashboard from '../components/DoctorDashboard';
import Footer from '../components/footer';
import { useUser } from '../UserContext';

export default function DoctorDashboardPage() {
  const { user, loading } = useUser();
  if (loading) return null;
  if (!user) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <DoctorDashboard />
      <Footer />
    </div>
  );
} 