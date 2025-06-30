import Navbar from '../components/Navbar'
import SignIn from '../components/SignInModal'
import Footer from '../components/footer'

export default function RiskAssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <SignIn/>
      <Footer />
    </div>
  )
}