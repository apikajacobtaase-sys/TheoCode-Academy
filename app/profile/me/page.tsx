'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileMeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 🎯 Ask the API "Who am I?" and redirect to the real profile
    fetch('/api/profiles/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.username) {
          // Redirect to the real profile page
          router.replace(`/profile/${data.username}`);
        } else {
          // No username yet, show a message
          document.getElementById('loading-msg')!.innerText = 
            'Please set your username in your account settings first.';
        }
      })
      .catch(() => {
        router.replace('/');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p id="loading-msg" className="text-green-400 animate-pulse text-lg">
        Loading your profile...
      </p>
    </div>
  );
}