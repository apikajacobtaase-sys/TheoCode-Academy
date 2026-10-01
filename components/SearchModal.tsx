'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    courses: [],
    challenges: [],
    users: [],
    squads: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults({ courses: [], challenges: [], users: [], squads: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ courses: [], challenges: [], users: [], squads: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = results.courses.length + results.challenges.length + 
                       results.users.length + results.squads.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Search Input */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, challenges, users, squads..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-white transition p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded border border-gray-700">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-3">Searching...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p>Type at least 2 characters to search</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">😕</div>
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Courses */}
              {results.courses.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📚 Courses ({results.courses.length})
                  </h3>
                  <div className="space-y-2">
                    {results.courses.map((course: any) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        onClick={onClose}
                        className="block p-3 bg-black rounded-lg border border-gray-800 hover:border-green-500/50 transition group"
                      >
                        <p className="text-white font-medium group-hover:text-green-400 transition">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                          {course.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {results.challenges.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    🏆 Challenges ({results.challenges.length})
                  </h3>
                  <div className="space-y-2">
                    {results.challenges.map((challenge: any) => (
                      <Link
                        key={challenge.id}
                        href={`/challenges/${challenge.id}`}
                        onClick={onClose}
                        className="block p-3 bg-black rounded-lg border border-gray-800 hover:border-green-500/50 transition group"
                      >
                        <p className="text-white font-medium group-hover:text-green-400 transition">
                          {challenge.title}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                          {challenge.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    👥 Users ({results.users.length})
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((user: any) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800 hover:border-green-500/50 transition group"
                      >
                        <img
                          src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.title || 'U')}&background=16a34a&color=fff&size=200`}
                          alt={user.title}
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                        />
                        <p className="text-white font-medium group-hover:text-green-400 transition">
                          {user.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Squads */}
              {results.squads.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    🛡️ Squads ({results.squads.length})
                  </h3>
                  <div className="space-y-2">
                    {results.squads.map((squad: any) => (
                      <Link
                        key={squad.id}
                        href={`/squad/${squad.id}`}
                        onClick={onClose}
                        className="block p-3 bg-black rounded-lg border border-gray-800 hover:border-green-500/50 transition group"
                      >
                        <p className="text-white font-medium group-hover:text-green-400 transition">
                          {squad.title}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                          {squad.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}