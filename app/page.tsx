'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* 🎯 1. HERO SECTION WITH ANIMATED BACKGROUND */}
      <div className="relative min-h-[90vh] flex items-center justify-center">
        
        {/* Background Image with Professional Overlay */}
        <div className="absolute inset-0 z-0">
          {/* REPLACE 'hero-coding-bg.jpg' WITH YOUR ACTUAL PEXELS IMAGE NAME */}
          <Image
            src="/images/hero-coding-bg.jpg"
            alt="Students learning to code"
            fill
            className="object-cover opacity-40"
            priority
          />
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-purple-900/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Now Enrolling: Full-Stack Development
          </div>

          {/* Main Headline with Gradient Text */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            Master Coding with{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent">
              TheoCode Academy
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Interactive courses, real-time code execution, and a community of builders. 
            Start your journey from beginner to pro today.
          </p>

          {/* 🎯 CALL TO ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <>
                <Link
                  href="/explore"
                  className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-2"
                >
                  Explore Courses
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-2"
                >
                  Create Free Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link
                  href="/sign-in"
                  className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/20 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🎯 2. FEATURES SECTION WITH HOVER CARDS */}
      <div className="relative z-10 bg-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose TheoCode?</h2>
            <p className="text-gray-400 text-lg">Everything you need to become a professional developer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-green-500/50 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">In-Browser Code Execution</h3>
              <p className="text-gray-400 leading-relaxed">Write, run, and test your code instantly without setting up local environments.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500/50 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gamified Learning</h3>
              <p className="text-gray-400 leading-relaxed">Earn points, unlock achievements, and climb the global leaderboard as you learn.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Community Squads</h3>
              <p className="text-gray-400 leading-relaxed">Join study groups, collaborate in real-time, and learn alongside peers.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}