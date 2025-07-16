'use client';
import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, Shield, Brain, Stethoscope, LogIn } from 'lucide-react';
import { useUser } from '../UserContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, role, setRole } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Risk Assessment', href: '/risk-assessment' },
    { name: 'Reports & Analytics', href: '/Reports' },

  ];

  const handleLogout = async () => {
    await signOut(auth);
    setRole(null);
    setDropdownOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-xl border-b border-pink-200/50 shadow-lg shadow-pink-100/50' 
        : 'bg-white/70 backdrop-blur-xl border-b border-pink-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center relative overflow-hidden">
                <Heart className="w-5 h-5 text-white gentle-heartbeat" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                CerviCare AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-pink-500 transition-colors duration-300 font-medium text-sm relative group"
              >
                {link.name}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500 group-hover:w-full transition-all duration-300"></div>
              </a>
            ))}
          </div>

          {/* CTA Button or User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setDropdownOpen((open) => !open);
                  }}
                  className="focus:outline-none flex items-center"
                  aria-label="Open profile menu"
                >
                  <img
                    src={user.photoURL || './defaultpic.jpg'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-pink-400 shadow-sm object-cover bg-white cursor-pointer"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/doctor-dashboard');
                      setDropdownOpen(false);
                    }}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                    <div className="px-4 py-2 text-sm text-gray-700 font-semibold truncate">
                      {user.displayName || user.email}
                    </div>
                    <div className="px-4 py-2 text-xs text-gray-500 capitalize">
                      {role || 'No role'}
                    </div>
                    <hr className="my-1" />
                    <a href="/doctor-dashboard" onClick={(e) => { e.preventDefault(); router.push('/doctor-dashboard'); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-xl">Profile</a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-pink-50 rounded-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/signup" className="px-4 py-2 text-pink-500 hover:text-pink-600 font-semibold transition-colors duration-300 flex items-center gap-2 text-sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </a>
                <button className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4" />
                  Start Assessment
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-pink-500"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-pink-200/50 shadow-lg">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-600 hover:text-pink-500 transition-colors duration-300 font-medium py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 space-y-3">
                <a href="/signup" className="w-full px-4 py-2 text-pink-500 hover:text-pink-600 font-semibold transition-colors duration-300 flex items-center justify-center gap-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </a>
                <button className="w-full px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4" />
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </nav>
  );
};

export default Navbar;