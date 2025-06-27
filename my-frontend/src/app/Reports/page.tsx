import Navbar from '../components/Navbar'
import ReportsAnalysis from '../components/ReportsAnalysis'
import Footer from '../components/footer'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <ReportsAnalysis />
      <Footer />
    </div>
  )
}