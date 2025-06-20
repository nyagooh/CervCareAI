'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Heart, ArrowRight, Sparkles, Shield, Play, Users, BarChart3, Stethoscope, Activity, Brain, Zap } from 'lucide-react';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [neuralNodes, setNeuralNodes] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Create neural network nodes
    const nodes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 4 + 2,
    }));
    setNeuralNodes(nodes);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 pt-16">
      {/* AI Neural Network Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Neural Network Nodes */}
        {neuralNodes.map((node) => (
          <div
            key={node.id}
            className="absolute rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              animationDelay: `${node.delay}s`,
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
            }}
          />
        ))}
        
        {/* Neural Connections */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent animate-pulse"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              width: `${Math.random() * 200 + 100}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Floating AI Brain Elements */}
        <div className="absolute top-20 left-10">
          <Brain className="w-16 h-16 text-pink-300 gentle-float brain-pulse" />
        </div>
        <div className="absolute bottom-20 right-10">
          <Zap className="w-12 h-12 text-purple-300 gentle-float" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="absolute top-1/2 left-5">
          <Activity className="w-10 h-10 text-cyan-300 gentle-float" style={{ animationDelay: '-1s' }} />
        </div>
      </div>

      {/* Soft Background Elements */}
      <div className="absolute inset-0">
        {/* Gentle Gradient Orbs */}
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-200/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${20 + mousePosition.x * 0.01}%`,
            top: `${10 + mousePosition.y * 0.01}%`,
          }}
        ></div>
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"
          style={{
            right: `${10 + mousePosition.x * 0.008}%`,
            bottom: `${20 + mousePosition.y * 0.008}%`,
            animationDelay: '2s',
          }}
        ></div>
        
        {/* Floating Health Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-pink-300/20 rounded-full animate-pulse health-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-pink-200/50 rounded-full px-4 py-2 mb-6 soft-shadow">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-600">Code Her Care Hackathon Winner</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-gray-800">Reimagining</span>
              <span className="block bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Cervical Cancer
              </span>
              <span className="block text-gray-800">Care</span>
              <span className="block text-2xl md:text-3xl font-normal text-gray-600 mt-2">
                with Data & Empathy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A predictive health system developed by women in tech to improve 
              <span className="text-pink-500 font-semibold"> early detection</span>, 
              <span className="text-purple-500 font-semibold"> care access</span>, and 
              <span className="text-cyan-500 font-semibold"> awareness</span> around cervical cancer.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-purple-200/50 rounded-full px-3 py-1.5 soft-shadow">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-600">Early Detection</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-pink-200/50 rounded-full px-3 py-1.5 soft-shadow">
                <BarChart3 className="w-3 h-3 text-pink-400" />
                <span className="text-xs text-gray-600">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-cyan-200/50 rounded-full px-3 py-1.5 soft-shadow">
                <Heart className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-gray-600">Care Management</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="group px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 flex items-center justify-center gap-2 soft-button">
                <Stethoscope className="w-4 h-4 group-hover:animate-pulse" />
                Explore the Vision
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group px-6 py-3 bg-white/70 backdrop-blur-xl border border-pink-200/50 text-pink-600 font-semibold rounded-full hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-2 soft-button-outline">
                <Play className="w-4 h-4" />
                Learn About the System
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center glass-card p-4 soft-hover">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-pink-200/30 soft-pulse">
                  <BarChart3 className="w-5 h-5 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">85%</div>
                <div className="text-xs text-gray-500">Detection Accuracy</div>
              </div>
              
              <div className="text-center glass-card p-4 soft-hover">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-purple-200/30 soft-pulse">
                  <Heart className="w-5 h-5 text-purple-400 gentle-heartbeat" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">24/7</div>
                <div className="text-xs text-gray-500">Care Support</div>
              </div>
              
              <div className="text-center glass-card p-4 soft-hover">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 rounded-xl flex items-center justify-center mx-auto mb-2 border border-cyan-200/30 soft-pulse">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">100%</div>
                <div className="text-xs text-gray-500">Women-Led</div>
              </div>
            </div>
          </div>

          {/* Right Content - Health Images with Black Women */}
          <div className="relative">
            {/* Main Health Image - Black Woman Healthcare Professional */}
            <div className="relative glass-card p-6 soft-hover">
              <Image 
                src="/front-view-doctor-holding-anatomic-model.jpg" 
                alt="Healthcare professional with medical technology" 
                width={600}
                height={320}
                className="w-full h-80 object-cover rounded-2xl"
                priority
              />
              
              {/* Floating AI Prediction Card */}
              <div className="absolute top-8 right-8 glass-card p-3 soft-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-400 brain-pulse" />
                  <span className="text-sm text-gray-700 font-medium">AI Prediction</span>
                </div>
                <div className="text-xs text-gray-500">92% Accuracy Rate</div>
              </div>

              {/* Floating Care Access Card */}
              <div className="absolute bottom-8 left-8 glass-card p-3 soft-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-pink-400 gentle-heartbeat" />
                  <span className="text-sm text-gray-700 font-medium">Care Access</span>
                </div>
                <div className="text-xs text-gray-500">24/7 Support</div>
              </div>

              {/* Neural Network Overlay */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-12 left-12 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Neural connections */}
                <div className="absolute top-6 left-6 w-16 h-px bg-gradient-to-r from-pink-400 to-transparent animate-pulse"></div>
                <div className="absolute bottom-14 right-8 w-12 h-px bg-gradient-to-l from-cyan-400 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>

            {/* Secondary Health Images - Women's Healthcare */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="glass-card p-3 soft-hover">
                <Image 
                  src="/women-s-health-women-s-healthcare-concept-with-uterus.jpg" 
                  alt="Women's healthcare concept with medical illustration" 
                  width={200}
                  height={96}
                  className="w-full h-24 object-cover rounded-xl"
                />
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-700">Women's Health Focus</div>
                </div>
                {/* Mini neural nodes */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="glass-card p-3 soft-hover">
                <Image 
                  src="/reproductive-system-stethoscope-flat-lay.jpg" 
                  alt="Doctor with anatomical model for medical education" 
                  width={200}
                  height={96}
                  className="w-full h-24 object-cover rounded-xl"
                />
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-700">Medical Education</div>
                </div>
                {/* Mini neural nodes */}
                <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              </div>
            </div>

            {/* Floating AI Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full opacity-60 animate-pulse flex items-center justify-center" style={{ animationDelay: '1s' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Health Indicators with AI Theme */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 hidden xl:block">
        <div className="glass-card p-3 gentle-float">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-cyan-400 brain-pulse" />
            <span className="text-sm text-gray-700 font-medium">AI-Powered</span>
          </div>
          <div className="text-xs text-gray-500">Neural Analysis</div>
        </div>
      </div>

      <div className="absolute right-8 top-1/3 hidden xl:block">
        <div className="glass-card p-3 gentle-float" style={{ animationDelay: '-1s' }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-gray-700 font-medium">Real-time</span>
          </div>
          <div className="text-xs text-gray-500">Health Monitoring</div>
        </div>
      </div>

      {/* Additional AI Neural Network Elements */}
      <div className="absolute top-1/4 left-1/4 hidden lg:block">
        <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse opacity-40"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/3 hidden lg:block">
        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.2s' }}></div>
      </div>
    </section>
  );
};

export default Hero;