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

  // 🎯 Fetch username. If it doesn't exist, the API will handle it!
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

  // 🎯 Helper to get the user's initial for the fallback avatar
  const userInitial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();
  const profileHref = username ? `/profile/${username}` : '/profile/me';

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
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent hidden sm:block">
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
                
                {!isAdmin && (
                  <Link href="/my-learning" className="text-gray-300 hover:text-green-400 font-medium transition">My Learning</Link>
                )}
                
                {isAdmin && (
                  <Link href="/admin" className="text-gray-300 hover:text-purple-400 font-medium transition flex items-center gap-1">⚙️ Admin</Link>
                )}
              </>
            )}
          </div>

          {/* 🎯 3. AUTH BUTTONS + NOTIFICATIONS (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  
                  {/* 🎯 POLISHED PROFILE LINK WITH DYNAMIC AVATAR */}
                  <Link 
                    href={profileHref}
                    className="flex items-center gap-2 group"
                    title="My Profile"
                  >
                    {user?.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt="Profile" 
                        width={36} 
                        height={36} 
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-green-500 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white border-2 border-gray-700 group-hover:border-green-400 transition-all duration-300">
                        {userInitial}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-300 group-hover:text-green-400 transition max-w-[100px] truncate">
                      {username || user?.username || 'Profile'}
                    </span>
                  </Link>
                  
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 border-2 border-gray-700 hover:border-green-500 transition-all duration-300"
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
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition"
            >
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
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          
          <Link href="/explore" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
          <Link href="/courses" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>Courses</Link>

          {isSignedIn && (
            <>
              <div className="border-t border-gray-800 my-2"></div>
              
              {/* 🎯 POLISHED MOBILE PROFILE CARD */}
              <Link 
                href={profileHref}
                className="flex items-center gap-3 px-3 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition border border-gray-700/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="Profile" width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-base font-bold text-white">
                    {userInitial}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{user?.firstName || user?.username || 'User'}</span>
                  <span className="text-gray-400 text-xs">View Profile →</span>
                </div>
              </Link>

              <Link href="/dashboard" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/challenges" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>🏆 Challenges</Link>
              <Link href="/squad" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>Squads</Link>
              <Link href="/leaderboard" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
              
              {!isAdmin && (
                <Link href="/my-learning" className="block text-gray-300 hover:text-green-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>My Learning</Link>
              )}
              
              {isAdmin && (
                <Link href="/admin" className="block text-gray-300 hover:text-purple-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-800 transition" onClick={() => setMobileMenuOpen(false)}>⚙️ Admin Panel</Link>
              )}
            </>
          )}

          <div className="border-t border-gray-800 my-2"></div>
          {isLoaded && (
            isSignedIn ? (
              <div className="py-2 px-2">
                <UserButton 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      userButtonPopoverCard: "right-0 left-auto"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-2">
                <SignInButton mode="modal">
                  <button className="w-full text-center text-gray-300 hover:text-white font-medium py-2.5 border border-gray-700 rounded-lg hover:bg-gray-800 transition">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full text-center bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg transition hover:scale-[1.02]">Get Started</button>
                </SignUpButton>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}