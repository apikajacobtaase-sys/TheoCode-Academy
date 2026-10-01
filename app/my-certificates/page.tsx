'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function MyCertificatesPage() {
  const { user, isLoaded } = useUser();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCertificates();
    }
  }, [isLoaded, user]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-xl">Loading certificates...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your certificates</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">🎓 My Certificates</h1>
          <p className="text-gray-400">
            Your earned certificates and achievements.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800 border-dashed">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No certificates yet</h2>
            <p className="text-gray-400 mb-8">Complete a course to earn your first certificate!</p>
            <Link 
              href="/explore" 
              className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    🎓
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {cert.course_description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Issued {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                      <span className="text-green-400 font-mono">
                        {cert.certificate_number}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}