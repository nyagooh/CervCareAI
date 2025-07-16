'use client';

import React, { useState } from 'react';
import { X, LogIn, Shield, Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { useUser } from '../UserContext';
import { useRouter } from 'next/navigation';

async function addDoctorToFirestore(user: any) {
  if (!user) return;
  const { uid, displayName, email, photoURL } = user;
  const doctorRef = (await import('firebase/firestore')).doc(db, 'doctors', uid);
  const setDoc = (await import('firebase/firestore')).setDoc;
  await setDoc(doctorRef, {
    name: displayName || '',
    email: email,
    photoURL: photoURL || '',
    createdAt: new Date()
  }, { merge: true });
}

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [signInError, setSignInError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setSignInError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await addDoctorToFirestore(result.user);
      router.push('/doctor-dashboard');
    } catch (error) {
      setSignInError('Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await addDoctorToFirestore(result.user);
      router.push('/doctor-dashboard');
    } catch (error) {
      setSignInError('Email sign-in failed. Please check your credentials.');
      console.error('Email sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-6 text-white rounded-xl mb-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to CerviCare AI</h2>
              <p className="text-pink-100 text-sm">Your health journey starts here</p>
            </div>
          </div>
        </div>
        {/* Content */}
        <div>
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-pink-200 hover:bg-pink-50 transition-all duration-300 font-semibold text-gray-700 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value && !e.target.value.includes('@')) {
                      setEmailError('Please enter a valid email address.');
                    } else {
                      setEmailError('');
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 ${emailError ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {signInError && (
              <p className="text-red-500 text-xs mt-1 text-center">{signInError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Signing in...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 text-pink-500 hover:text-pink-600 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your data is secure and private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 