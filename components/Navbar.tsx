'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const [username, setUsername] = useState<string>('');

  // 🎯 Check admin status directly from Clerk metadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // 🎯 Fetch username. If it doesn't exist, the API will create it automatically!
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/profiles/me')
        .then((r) => r.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
          } else {
            setUsername('');
          }
        })
        .catch(() => setUsername(''));
    }
  }, [isSignedIn, user]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🎯 1. LOGO */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <Image 
              src="/logo.png" 
              alt="TheoCode Academy" 
              width={40} 
              height={40} 
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
              TheoCode
            </span>
          </Link>

          {/* 🎯 2. DESKTOP NAVIGATION LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-300 hover:text-green-400 font-medium transition">Explore</Link>
            <Link href="/courses" className="text-gray-300 hover:text-green-400 font-medium transition">Courses</Link>

            {isSignedIn && (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-green-400 font-medium transition">Dashboard</Link>
                <Link href="/challenges" className="text-gray-300 hover:text-green-400 font-medium transition flex items-center gap-1">🏆 Challenges</Link>
                <Link href="/squad" className="text-gray-300 hover:text-green-400 font-medium transition">Squads</Link>
                <Link href="/leaderboard" className="text-gray-300 hover:text-green-400 font-medium transition">Leaderboard</Link>
                
                {/* 🎯 Hide "My Learning" for Admins */}
                {!isAdmin && (
                  <Link href="/my-learning" className="text-gray-300 hover:text-green-400 font-medium transition">My Learning</Link>
                )}
                
                {/* 🎯 Admin Link (Points to main dashboard) */}
                {isAdmin && (
                  <Link href="/admin" className="text-gray-300 hover:text-purple-400 font-medium transition flex items-center gap-1">⚙️ Admin</Link>
                )}
              </>
            )}
          </div>

          {/* 🎯 3. AUTH BUTTONS + NOTIFICATIONS (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  
                  {/* 🎯 Profile Link */}
                  <Link 
                    href="/profile/me"
                    className="text-gray-300 hover:text-green-400 font-medium transition text-sm"
                    title="My Profile"
                  >
                    👤
                  </Link>
                  
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 border-2 border-green-500/50 hover:border-green-400 transition"
                      }
                    }}
                  />
                </div>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="text-gray-300 hover:text-white font-medium px-4 py-2 transition">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold transition hover:scale-105 transform duration-200">Get Started</button>
                  </SignUpButton>
                </>
              )
            )}
          </div>

          {/* 🎯 4. MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center gap-2">
            {isSignedIn && <NotificationBell />}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 5. MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-4 space-y-3">
          <Link href="/explore" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
          <Link href="/courses" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Courses</Link>

          {isSignedIn && (
            <>
              <div className="border-t border-gray-800 my-2"></div>
              <Link href="/dashboard" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/challenges" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>🏆 Challenges</Link>
              <Link href="/squad" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Squads</Link>
              <Link href="/leaderboard" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
              
              {/* 🎯 Hide "My Learning" for Admins */}
              {!isAdmin && (
                <Link href="/my-learning" className="block text-gray-300 hover:text-green-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>My Learning</Link>
              )}
              
             <Link href="/profile" className="px-4 py-2 text-gray-300 hover:text-white transition">
  My Profile
</Link>
              {/* 🎯 Admin Link */}
              {isAdmin && (
                <Link href="/admin" className="block text-gray-300 hover:text-purple-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>⚙️ Admin Panel</Link>
              )}
            </>
          )}

          <div className="border-t border-gray-800 my-2"></div>
          {isLoaded && (
            isSignedIn ? (
              <div className="py-2">
                <UserButton />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <SignInButton mode="modal">
                  <button className="w-full text-center text-gray-300 hover:text-white font-medium py-2 border border-gray-700 rounded-lg">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full text-center bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg">Get Started</button>
                </SignUpButton>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}