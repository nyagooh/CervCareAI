'use client';
import React from 'react';
import {Heart, Mail, Phone, MapPin, Shield, FileText}from 'lucide-react';

const Footer = () =>{
    const quickLinks = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Risk Assessment', href: '/risk-assessment' },
        { name: 'Reports & Analytics', href: '/reports' },
        { name: 'Health Resources', href: '#resources' }
      ];
      return (
        <footer className="relative bg-pink-500">
          <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Heart className="w-7 h-7 text-pink-500 gentle-heartbeat" />
                  </div>
                  <span className="text-2xl font-bold text-white">CerviCare AI</span>
                </div>
                
                <p className="text-pink-100 mb-8 leading-relaxed max-w-md">
                  Empowering women worldwide with AI-powered cervical cancer risk assessment. 
                  Combining cutting-edge technology with compassionate healthcare.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-pink-100">
                    <Mail className="w-4 h-4 text-white" />
                    <span className="text-sm">codessipers@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-pink-100">
                    <Phone className="w-4 h-4 text-white" />
                    <span className="text-sm">+254724318117</span>
                  </div>
                  <div className="flex items-center gap-3 text-pink-100">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-sm">Kisumu,Kenya</span>
                  </div>
                </div>
              </div>
    
              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-white mb-6 tracking-wider text-sm">QUICK LINKS</h3>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-pink-100 hover:text-white transition-colors duration-300 text-sm">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
      <footer/>        
         );
           
    };
   export default Footer;