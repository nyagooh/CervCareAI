import Navbar from '../components/Navbar'
import SignInModal from '../components/SignInModal'
import Footer from '../components/footer'

export default function RiskAssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <SignInModal isOpen={true} onClose={() => {}} />
      <Footer />
    </div>
  )
}