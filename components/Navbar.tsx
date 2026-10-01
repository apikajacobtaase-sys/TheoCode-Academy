'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useIsAdmin } from '@/lib/useIsAdmin';
import { NotificationBell } from './NotificationBell';
import { useTheme } from 'next-themes';
import Logo from './Logo';
import SearchModal from './SearchModal';
import { useAuth } from '@clerk/nextjs';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { userId } = useAuth();

  // 🎯 Define your admin user IDs here (add your actual Clerk User ID)
  const ADMIN_USER_IDS = [
    'user_3JcXBMvm90Mn0hYmaroP2Oh1e5A', // Replace with your actual Clerk User ID
  ];

  // 🎯 Now define isAdmin AFTER ADMIN_USER_IDS
  const isAdmin = userId && ADMIN_USER_IDS.includes(userId);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isLoaded) {
    return (
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 h-16" />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50 shadow-lg shadow-black/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ==================== LOGO ==================== */}
          <Logo />

          {/* ==================== DESKTOP MENU (Full Links) ==================== */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* LEARNER-ONLY LINKS */}
            {!isAdmin && (
              <>
                <Link href="/explore" className="text-white hover:text-purple-400 transition font-medium">
                  🔍 Explore
                </Link>
                <Link href="/my-learning" className="text-white hover:text-purple-400 transition font-medium">
                  📖 My Learning
                </Link>
                
                <Link href="/challenges" className="text-white hover:text-purple-400 transition font-medium">
                  🏆 Challenges
                </Link>
                <Link href="/leaderboard" className="text-white hover:text-purple-400 transition font-medium">
                  🏅 Leaderboard
                </Link>
              </>
            )}

            {/* SHARED LINKS */}
            <Link href="/squad" className="text-white hover:text-purple-400 transition font-medium">
              🛡️ Squads
            </Link>
            <Link href="/about" className="text-white hover:text-purple-400 transition font-medium">
              ℹ️ About
            </Link>
            <Link href="/dashboard" className="text-white hover:text-purple-400 transition font-medium">
              📊 Dashboard
            </Link>
            
            {user ? (
              <>
                {!isAdmin && (
                  <Link href="/my-certificates" className="text-white hover:text-purple-400 transition font-medium">
                    🎓 Certificates
                  </Link>
                )}
                 {isAdmin && (
  <Link
    href="/admin/challenges"
    className="text-gray-300 hover:text-green-400 transition font-medium flex items-center gap-1"
  >
    <span>⚙️</span> Admin
  </Link>
)}
                {isAdmin && (
                  <Link href="/admin" className="text-green-400 hover:text-green-300 transition font-bold">
                    👑 Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-900 transition text-white hover:text-green-400"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <NotificationBell />

                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-900 transition text-white hover:text-purple-400"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {mounted && theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                <UserButton 
                 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 border-2 border-purple-500 rounded-full",
                      userButtonPopoverCard: "bg-black border border-gray-800",
                      userButtonPopoverActionButton: "text-white hover:bg-gray-900",
                      userButtonPopoverActionButtonText: "text-white",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-900 transition text-white hover:text-green-400"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition text-white">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>

          {/* ==================== MOBILE: ALWAYS VISIBLE ACTIONS ==================== */}
          <div className="flex md:hidden items-center gap-1">
            
            {/* 🔍 Search (Always visible on mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-900 transition text-white hover:text-green-400"
              title="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 🔔 Notifications (Only for logged-in users) */}
            {user && <NotificationBell />}

            {/* 👤 User Button OR Sign In */}
            {user ? (
              <UserButton 
              
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-purple-500 rounded-full",
                    userButtonPopoverCard: "bg-black border border-gray-800",
                    userButtonPopoverActionButton: "text-white hover:bg-gray-900",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-sm transition text-white">
                  Sign In
                </button>
              </SignInButton>
            )}

            {/* 🍔 Hamburger Menu (For secondary links) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-purple-400 p-2 ml-1"
              aria-label="Toggle menu"
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

        {/* ==================== MOBILE DROPDOWN MENU (Secondary Links) ==================== */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 bg-black">
            <div className="flex flex-col gap-3 px-4">
              
              {/* LEARNER-ONLY LINKS */}
              {!isAdmin && (
                <>
                  <Link href="/explore" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <span>🔍</span> Explore Courses
                  </Link>
                  <Link href="/my-learning" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <span>📖</span> My Learning
                  </Link>
                  <Link href="/challenges" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <span>🏆</span> Challenges
                  </Link>
                  <Link href="/leaderboard" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <span>🏅</span> Leaderboard
                  </Link>
                </>
              )}

              {/* SHARED LINKS */}
              <Link href="/squad" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <span>🛡️</span> Squads
              </Link>
              <Link href="/about" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <span>ℹ️</span> About
              </Link>
              <Link href="/dashboard" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <span>📊</span> Dashboard
              </Link>
              
              {user ? (
                <>
                  {!isAdmin && (
                    <Link href="/my-certificates" className="text-white hover:text-purple-400 transition py-2 font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <span>🎓</span> Certificates
                    </Link>
                  )}

                  {isAdmin && (
                    <Link href="/admin" className="text-green-400 hover:text-green-300 transition py-2 font-bold flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <span>👑</span> Admin Panel
                    </Link>
                  )}
                  
                  {/* Theme Toggle */}
                  <div className="pt-3 border-t border-gray-800 mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Theme</span>
                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1.5 rounded-lg hover:bg-gray-900 transition text-white hover:text-purple-400 text-sm"
                    >
                      {mounted && theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button 
                    className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}