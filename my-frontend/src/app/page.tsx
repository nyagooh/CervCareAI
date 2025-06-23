import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';

import HowItWorks from './components/HowItWorks';
import Footer from './components/footer';


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <Navbar />
      <Hero />
      <About />
      <HowItWorks/>
      <Footer/>
       </div>
  )
}