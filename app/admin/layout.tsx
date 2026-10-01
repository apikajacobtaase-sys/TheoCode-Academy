'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Challenges', href: '/admin/challenges', icon: '🎯' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* 🎯 Collapsible Sidebar */}
      <aside 
        className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4">
          {!isCollapsed && <span className="text-xl font-bold text-green-400">Admin</span>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive 
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800">
          <Link 
            href="/" 
            className={`flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="text-xl flex-shrink-0">🏠</span>
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Back to App</span>}
          </Link>
        </div>
      </aside>

      {/* 🎯 Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-bold text-white">
            {navItems.find(item => pathname.startsWith(item.href))?.name || 'Admin Panel'}
          </h1>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          {children}
        </div>
      </main>
    </div>
  );
}