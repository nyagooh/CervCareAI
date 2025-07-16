import Navbar from '../components/Navbar';
import DoctorDashboard from '../components/DoctorDashboard';
import Footer from '../components/footer';

export default function DoctorDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <DoctorDashboard />
      <Footer />
    </div>
  );
} 