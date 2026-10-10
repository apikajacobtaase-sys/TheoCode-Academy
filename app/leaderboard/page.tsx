'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

type Period = 'week' | 'month' | 'all';

interface LeaderboardUser {
  rank: number;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  points: number;
}

// ============ ICON COMPONENTS ============

const CrownIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 7l5.5 4L12 4l3.5 7L21 7l-2 9H5zm0 2h14v2H5v-2z" />
  </svg>
);

const CoinIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" fill="none" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400E">$</text>
  </svg>
);

const SearchIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// ============ HELPER COMPONENTS ============

const Avatar = ({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-24 h-24 md:w-28 md:h-28 text-3xl',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover bg-gray-100 flex-shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
};

// ============ MAIN COMPONENT ============

export default function LeaderboardPage() {
  const { isSignedIn } = useUser();
  const [period, setPeriod] = useState<Period>('week');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: 'THIS WEEK' },
    { key: 'month', label: 'THIS MONTH' },
    { key: 'all', label: 'ALL TIME' },
  ];

  // Podium arrangement: [2nd, 1st, 3rd]
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 pb-24 md:pb-8">
      {/* ============ HEADER ============ */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 pt-6 pb-4 md:pt-8 md:pb-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Leaderboard
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-4 md:pt-6 space-y-4 md:space-y-5">
        {/* ============ SEARCH ROW ============ */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leaderboard"
              className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition shadow-sm"
              aria-label="Search leaderboard"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border transition shadow-sm flex-shrink-0 ${
              showFilter
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
            aria-label="Toggle filters"
          >
            <FilterIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ============ TIME PERIOD SELECTOR ============ */}
        <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 px-2 rounded-full text-[11px] md:text-xs font-bold tracking-wide transition ${
                period === p.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

             {/* ============ PODIUM CARD ============ */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading leaderboard...</p>
          </div>
        ) : top3.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm pt-8 pb-6 px-3 md:px-6">
            <div className="flex items-end justify-center gap-2 md:gap-4">
              
              {/* 🥈 2nd Place (Left) */}
              {top3[1] && <PodiumUser user={top3[1]} place={2} />}
              
              {/* 🥇 1st Place (Center, rendered second in DOM but visually centered via flex) */}
              {top3[0] && <PodiumUser user={top3[0]} place={1} />}
              
              {/* 🥉 3rd Place (Right) */}
              {top3[2] && <PodiumUser user={top3[2]} place={3} />}
              
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">No users on the leaderboard yet.</p>
          </div>
        )}

        {/* ============ REMAINING USERS ============ */}
        {rest.length > 0 && (
          <div className="space-y-2">
            {rest.map((user) => (
              <RankCard key={user.user_id} user={user} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm">
              {search ? 'No users match your search.' : 'No users on the leaderboard yet.'}
            </p>
          </div>
        )}
      </div>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around pb-[env(safe-area-inset-bottom)] z-40"
        aria-label="Primary navigation"
      >
        <NavLink href="/" icon="home" label="Home" />
        <NavLink href="/clubs" icon="clubs" label="Clubs" />
        <NavLink href="/quiz" icon="quiz" label="Quiz" />
        <NavLink href="/leaderboard" icon="trophy" label="Leaderboard" active />
      </nav>
    </main>
  );
}

// ============ PODIUM USER COMPONENT ============

function PodiumUser({ user, place }: { user: LeaderboardUser; place: 1 | 2 | 3 }) {
  const isFirst = place === 1;

  const borderColors = {
    1: 'border-amber-400',
    2: 'border-gray-400',
    3: 'border-amber-700',
  };

  const labelBg = {
    1: 'bg-amber-100 text-amber-900',
    2: 'bg-gray-100 text-gray-700',
    3: 'bg-orange-100 text-orange-900',
  };

  const badgeBg = {
    1: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white',
    2: 'bg-gradient-to-br from-gray-300 to-gray-500 text-white',
    3: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white',
  };

  return (
    <div className={`flex flex-col items-center ${isFirst ? 'flex-1 max-w-[140px] md:max-w-[180px]' : 'flex-1 max-w-[110px] md:max-w-[140px]'}`}>
      {/* Crown (1st only) */}
      <div className={`h-5 md:h-6 flex items-center justify-center ${isFirst ? '' : 'invisible'}`}>
        <CrownIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-500 drop-shadow-sm" />
      </div>

      {/* Avatar with rank badge */}
      <div className="relative mb-2">
        <div className={`${isFirst ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full border-[3px] ${borderColors[place]} overflow-hidden bg-gray-100 flex items-center justify-center`}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold flex items-center justify-center ${isFirst ? 'text-2xl' : 'text-xl'}`}>
              {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
        </div>

        {/* Rank Badge */}
        <div className={`absolute -bottom-1 -left-1 w-6 h-6 md:w-7 md:h-7 rounded-full ${badgeBg[place]} flex items-center justify-center text-xs font-black shadow-sm border-2 border-white`}>
          {place}
        </div>
      </div>

      {/* Name Label */}
      <div className={`${labelBg[place]} rounded-full px-3 py-1 mb-1.5 max-w-full`}>
        <p className="text-xs font-bold truncate text-center">
          {user.display_name}
        </p>
      </div>

      {/* Points */}
      <div className="flex items-center gap-1">
        <CoinIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="text-xs md:text-sm font-bold text-amber-800">
          {user.points.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ============ RANK CARD COMPONENT ============

function RankCard({ user }: { user: LeaderboardUser }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 flex items-center gap-3 shadow-sm hover:border-gray-300 transition">
      {/* Rank */}
      <div className="w-7 md:w-8 text-center text-sm md:text-base font-black text-gray-400 flex-shrink-0">
        {user.rank}
      </div>

      {/* Avatar */}
      <Avatar src={user.avatar_url} name={user.display_name} size="md" />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-bold text-gray-900 truncate">
          {user.display_name}
        </p>
        {user.username && (
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        )}
      </div>

      {/* Points + Coin */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm md:text-base font-black text-amber-800">
          {user.points.toLocaleString()}
        </span>
        <CoinIcon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
    </div>
  );
}

// ============ BOTTOM NAV LINK ============

function NavLink({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    clubs: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    quiz: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    trophy: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center py-2 transition ${
        active
          ? 'text-orange-500'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <div className={`${active ? 'bg-orange-100 rounded-xl p-1.5' : ''}`}>
        {icons[icon]}
      </div>
      <span className={`text-[10px] mt-0.5 ${active ? 'font-bold' : ''}`}>{label}</span>
    </Link>
  );
}