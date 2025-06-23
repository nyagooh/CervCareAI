'use client';
import React from 'react';
import {Heart, Mail, Phone, MapPin, Linkedin, Twitter, Instagram}from 'lucide-react';

const Footer = () => {
    const quickLinks = [
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Risk Assessment', href: '/risk-assessment' },
        { name: 'Reports & Analytics', href: '/reports' },
        { name: 'Health Resources', href: '#resources' }
      ];
      const socialMedia = [
        { name: 'LinkedIn', href: 'https://www.linkedin.com/company/codessipers/?viewAsMember=true', icon: Linkedin },
        { name: 'Twitter', href: 'https://x.com/Codessipers', icon: Twitter },
        { name: 'Instagram', href: 'https://www.instagram.com/codessipers/', icon: Instagram }
      ];

      const legalLinks = [
        { name: 'Privacy Policy', href: '#privacy' },
        { name: 'Terms of Service', href: '#terms' },
        { name: 'Cookie Policy', href: '#cookies' }
      ];
      return (
        <footer className="relative bg-gradient-to-r from-pink-500 to-purple-600">
          <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-pink-500 gentle-heartbeat" />
                  </div>
                  <span className="text-lg font-bold text-white">CerviCare AI</span>
                </div>
                
                <p className="text-pink-100 mb-4 leading-relaxed max-w-sm text-sm">
                  AI-powered cervical cancer risk assessment combining technology with compassionate healthcare.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-pink-100">
                    <Mail className="w-3 h-3 text-white" />
                    <span className="text-xs">codessipers@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-pink-100">
                    <Phone className="w-3 h-3 text-white" />
                    <span className="text-xs">+254724318117</span>
                  </div>
                  <div className="flex items-center gap-2 text-pink-100">
                    <MapPin className="w-3 h-3 text-white" />
                    <span className="text-xs">Kisumu, Kenya</span>
                  </div>
                </div>
              </div>
    
              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-white mb-3 text-xs tracking-wider">QUICK LINKS</h3>
                <ul className="space-y-2">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-pink-100 hover:text-white transition-colors duration-300 text-xs hover:underline">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Legal Links */}
              <div>
                <h3 className="font-semibold text-white mb-3 text-xs tracking-wider">LEGAL</h3>
                <ul className="space-y-2">
                  {legalLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-pink-100 hover:text-white transition-colors duration-300 text-xs hover:underline">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-pink-400/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-pink-100 text-xs">
                  © 2024 CerviCare AI. All rights reserved.
                </div>
                
                {/* Social Media Icons */}
                <div className="flex items-center gap-2">
                  {socialMedia.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-100 hover:text-white transition-colors duration-300 p-1.5 hover:bg-pink-400/20 rounded-md"
                        aria-label={social.name}
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
                
                <div className="text-pink-100 text-xs flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-white animate-pulse" /> for women's health
                </div>
              </div>
            </div>
          </div> 
        </footer>        
      );
};

export default Footer;