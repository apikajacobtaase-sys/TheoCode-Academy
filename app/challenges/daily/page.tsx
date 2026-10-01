'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyChallengeRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's daily challenge
        const res = await fetch(`/api/challenges?is_daily=true&date=${today}`);
        
        if (res.ok) {
          const data = await res.json();
          
          if (data.challenges && data.challenges.length > 0) {
            // 🎯 Redirect to the specific daily challenge solving page
            router.push(`/challenges/${data.challenges[0].id}`);
          } else {
            // No daily challenge set for today, go to general challenges
            router.push('/challenges');
          }
        } else {
          router.push('/challenges');
        }
      } catch (error) {
        console.error('Failed to fetch daily challenge:', error);
        router.push('/challenges');
      }
    };

    fetchDaily();
  }, [router]);

  // Beautiful loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center">
      <div className="text-6xl mb-6 animate-bounce">🔥</div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">Loading today's challenge...</h2>
      <p className="text-gray-400 text-sm sm:text-base">Finding the best puzzle for you</p>
      
      {/* Loading spinner */}
      <div className="mt-8 w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}