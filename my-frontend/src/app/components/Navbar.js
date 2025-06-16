
'use client';
import React, { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
  
  const Navbar = () => {
    const[isOpen,setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);      
    };


  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Screening & Diagnosis', href: '#screening' },
    { label: 'Patient Management', href: '#management' },
    { label: 'Reports & Analytics', href: '#reports' },
    { label: 'Support', href: '#support' },
  ];

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-button-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-current" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl lg:text-2xl font-bold text-text-dark tracking-tight">
                CervCare
              </h1>
              <p className="text-xs lg:text-sm text-primary-purple font-medium -mt-1">
                AI Health System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-text-dark font-medium text-sm lg:text-base hover:text-primary-purple transition-colors duration-200 relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-button-gradient group-hover:w-full transition-all duration-300 rounded-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button className="text-text-dark font-medium text-sm lg:text-base hover:text-primary-purple transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/50">
              Sign In
            </button>
            <button className="bg-button-gradient text-white font-semibold px-6 py-3 rounded-xl text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-gradient-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-text-dark hover:bg-white/50 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-96 opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <nav className="flex flex-col space-y-4 pt-4 border-t border-white/20">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-dark font-medium text-base hover:text-primary-purple transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/30"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-white/20">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-dark font-medium text-base hover:text-primary-purple transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/30 text-left"
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-button-gradient text-white font-semibold px-6 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-gradient-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;