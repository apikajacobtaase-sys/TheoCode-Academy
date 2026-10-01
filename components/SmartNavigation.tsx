'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export function SmartNavigation() {
  const { user, isLoaded } = useUser();
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkIfInstructor();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkIfInstructor = async () => {
    try {
      // Check if user has created any courses
      const res = await fetch('/api/courses/check-instructor');
      if (res.ok) {
        const data = await res.json();
        setIsInstructor(data.isInstructor);
      }
    } catch (error) {
      console.error('Failed to check instructor status:', error);
    }
    setLoading(false);
  };

  if (!isLoaded || loading) {
    return (
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white font-bold text-xl hover:text-purple-400 transition">
          🎓 Theocode Academy
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* ADMIN/INSTRUCTOR NAVIGATION */}
              {isInstructor ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin"
                    className="text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/admin/courses"
                    className="text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    📚 My Courses
                  </Link>
                  <div className="px-2 py-1 bg-purple-900/30 border border-purple-500 rounded-full text-xs text-purple-300">
                    👑 Instructor
                  </div>
                </div>
              ) : (
                /* STUDENT NAVIGATION */
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/courses"
                    className="text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    🔍 Explore
                  </Link>
                  <Link
                    href="/my-learning"
                    className="text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    📖 My Learning
                  </Link>
                  <Link
                    href="/certificates"
                    className="text-gray-300 hover:text-white text-sm font-medium transition"
                  >
                    🏆 Certificates
                  </Link>
                </div>
              )}
                        <UserButton signOutOptions={{ redirectUrl: '/' }} />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-bold transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {user && !isInstructor && (
        <div className="md:hidden mt-3 flex gap-2 overflow-x-auto">
          <Link href="/courses" className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap">
            🔍 Explore
          </Link>
          <Link href="/my-learning" className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap">
            📖 My Learning
          </Link>
          <Link href="/certificates" className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 whitespace-nowrap">
            🏆 Certificates
          </Link>
        </div>
      )}
    </nav>
  );
}