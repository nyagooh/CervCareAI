import Navbar from '../components/Navbar'
import RiskAssessment from '../components/Risk-Assessment'
import RiskProfile from '../components/RiskProfile'
import Footer from '../components/footer'

export default function RiskAssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <RiskAssessment />
      <RiskProfile />
      <Footer />
    </div>
  )
}