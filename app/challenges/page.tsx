'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

// ============ TYPES ============
interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  language: string;
  category?: string;
  created_at: string;
  user_status?: 'solved' | 'attempted' | null;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';
type SortOption = 'newest' | 'points';

// ============ ICON COMPONENTS (inline SVG to avoid dependency issues) ============
const Icons = {
  Trophy: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  CheckCircle: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  BookOpen: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Search: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Bookmark: ({ className = '', filled = false }: { className?: string; filled?: boolean }) => (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  ArrowRight: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  Sparkles: ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

// ============ DIFFICULTY CONFIG ============
const DIFFICULTY_STYLES = {
  easy: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    label: 'Easy',
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    label: 'Medium',
  },
  hard: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    label: 'Hard',
  },
};

// ============ MAIN COMPONENT ============
export default function ChallengesPage() {
  const { isSignedIn, isLoaded } = useUser();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [language, setLanguage] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theocode_bookmarks');
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Fetch challenges
  useEffect(() => {
    if (!isLoaded) return;
    setLoading(true);
    fetch('/api/challenges')
      .then(r => r.json())
      .then(data => {
        if (data.success) setChallenges(data.challenges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  // Stats computation
  const stats = useMemo(() => {
    const solved = challenges.filter(c => c.user_status === 'solved').length;
    const attempted = challenges.filter(c => c.user_status === 'attempted').length;
    const totalPoints = challenges
      .filter(c => c.user_status === 'solved')
      .reduce((sum, c) => sum + (c.points || 0), 0);
    return {
      totalPoints,
      solved,
      inProgress: attempted,
      available: challenges.length,
    };
  }, [challenges]);

  // Available languages (for dropdown)
  const availableLanguages = useMemo(() => {
    const langs = new Set(challenges.map(c => c.language).filter(Boolean));
    return ['all', ...Array.from(langs)];
  }, [challenges]);

  // Filtered + sorted challenges
  const filtered = useMemo(() => {
    let result = [...challenges];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.language || '').toLowerCase().includes(q)
      );
    }

    if (difficulty !== 'all') {
      result = result.filter(c => c.difficulty === difficulty);
    }

    if (language !== 'all') {
      result = result.filter(c => c.language === language);
    }

    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'points') {
      result.sort((a, b) => (b.points || 0) - (a.points || 0));
    }

    return result;
  }, [challenges, search, difficulty, language, sort]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('theocode_bookmarks', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-mono">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ============ HEADER ============ */}
        <header className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Icons.Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
              Theocode Academy
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
            Coding Challenges
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Sharpen your algorithmic skills, earn points, and climb the academy leaderboard.
          </p>
        </header>

        {/* ============ STATS GRID ============ */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            icon={<Icons.Trophy className="w-5 h-5 text-amber-400" />}
            label="Total Points"
            value={stats.totalPoints.toLocaleString()}
            accent="border-amber-400/40"
          />
          <StatCard
            icon={<Icons.CheckCircle className="w-5 h-5 text-emerald-400" />}
            label="Solved"
            value={stats.solved.toString()}
            accent="border-emerald-400/40"
          />
          <StatCard
            icon={<Icons.Clock className="w-5 h-5 text-sky-400" />}
            label="In Progress"
            value={stats.inProgress.toString()}
            accent="border-sky-400/40"
          />
          <StatCard
            icon={<Icons.BookOpen className="w-5 h-5 text-violet-400" />}
            label="Available"
            value={stats.available.toString()}
            accent="border-violet-400/40"
          />
        </section>

        {/* ============ CONTROLS ============ */}
        <section className="space-y-4 mb-6 sm:mb-8">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, tag, or language..."
                className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition"
                aria-label="Search challenges"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400/50 cursor-pointer min-w-[140px]"
              aria-label="Sort challenges"
            >
              <option value="newest">Newest</option>
              <option value="points">Most Points</option>
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400/50 cursor-pointer min-w-[140px]"
              aria-label="Filter by language"
            >
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty pills — horizontally scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 flex-nowrap whitespace-nowrap pb-1">
              {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map(d => {
                const isActive = difficulty === d;
                const label = d === 'all' ? 'All Challenges' : DIFFICULTY_STYLES[d].label;
                const count =
                  d === 'all'
                    ? challenges.length
                    : challenges.filter(c => c.difficulty === d).length;
                return (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition border min-h-[44px] ${
                      isActive
                        ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/40'
                        : 'bg-[#1E293B] text-slate-400 border-[#334155] hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {label}
                    <span className={`ml-2 text-xs ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ CHALLENGES GRID ============ */}
        <section>
          {filtered.length === 0 ? (
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-10 text-center">
              <p className="text-slate-400 text-sm">
                {search || difficulty !== 'all' || language !== 'all'
                  ? 'No challenges match your filters.'
                  : 'No challenges available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isBookmarked={bookmarks.has(challenge.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ============ STAT CARD ============
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`bg-[#1E293B] border border-[#334155] rounded-xl p-4 shadow-sm border-l-2 ${accent} transition hover:border-slate-500`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

// ============ CHALLENGE CARD ============
function ChallengeCard({
  challenge,
  isBookmarked,
  onToggleBookmark,
}: {
  challenge: Challenge;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
}) {
  const style = DIFFICULTY_STYLES[challenge.difficulty] || DIFFICULTY_STYLES.easy;

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 shadow-sm hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-400/5 transition-all flex flex-col h-full"
    >
      {/* Top row: difficulty + bookmark */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${style.badge}`}>
          {style.label}
        </span>
        <button
          onClick={(e) => onToggleBookmark(challenge.id, e)}
          className={`p-2 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center ${
            isBookmarked
              ? 'text-emerald-400 bg-emerald-400/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
          }`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark challenge'}
        >
          <Icons.Bookmark className="w-4 h-4" filled={isBookmarked} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition line-clamp-2">
        {challenge.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
        {challenge.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {challenge.language && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {challenge.language}
          </span>
        )}
        {challenge.category && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 border border-slate-700">
            {challenge.category}
          </span>
        )}
        {challenge.user_status === 'solved' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Icons.CheckCircle className="w-3 h-3" />
            Solved
          </span>
        )}
        {challenge.user_status === 'attempted' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Icons.Clock className="w-3 h-3" />
            In Progress
          </span>
        )}
      </div>

      {/* Footer: points + CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-[#334155]">
        <div className="flex items-center gap-1.5">
          <Icons.Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">{challenge.points}</span>
          <span className="text-xs text-slate-500">pts</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 group-hover:gap-2.5 transition-all">
          Solve
          <Icons.ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}