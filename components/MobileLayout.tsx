'use client';

import { ReactNode } from 'react';

interface MobileNavProps {
  children: ReactNode;
  activeTab: 'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses';
  onTabChange: (tab: 'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses') => void;
  onAddPress: () => void;
}

export function MobileLayout({ 
  children, 
  activeTab, 
  onTabChange,
  onAddPress
}: MobileNavProps) {
  const navItems: Array<{id: 'home' | 'members' | 'add' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses', label: string, icon: string, isAction?: boolean}> = [
    { id: 'home', label: 'Beranda', icon: '🏠' },
    { id: 'members', label: 'Anggota', icon: '👥' },
    { id: 'calculator', label: 'Hitung', icon: '🧮' },
    { id: 'add', label: 'Tambah', icon: '➕', isAction: true },
    { id: 'polling', label: 'Polling', icon: '🏡' },
    { id: 'itinerary', label: 'Rundown', icon: '📋' },
    { id: 'expenses', label: 'Kas', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-white pb-24 sm:pb-0 transition-colors duration-200">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-gray-800 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Maganghub</p>
            <h1 className="truncate text-base font-black text-slate-950 dark:text-white">Villa Trip Manager</h1>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            Family Gathering
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden sm:block sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm shadow-blue-500/20">🏠</span>
            <div>
              <h1 className="text-lg font-black text-slate-950 dark:text-white">Villa Trip Family Gathering</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400">Kelola anggota, kas, rundown, dan polling villa</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border-t border-slate-200/80 dark:border-gray-800 px-2 py-2 shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:hidden z-50 safe-area-pb">
        <div className="flex items-end justify-around max-w-lg mx-auto gap-1">
          {navItems.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onAddPress}
                  aria-label="Tambah anggota"
                  className="flex flex-col items-center justify-center -mt-7 px-1"
                >
                  <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 dark:shadow-blue-500/25 active:scale-95 transition-transform ring-4 ring-white dark:ring-gray-900">
                    <span className="text-xl text-white">{item.icon}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-gray-400 mt-1 font-bold leading-none">{item.label}</span>
                </button>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.id !== 'add' && onTabChange(item.id as 'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses')}
                className={`flex min-w-[40px] flex-1 flex-col items-center justify-center rounded-xl px-1.5 py-1.5 transition-colors ${
                  isActive ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className={`text-lg leading-none transition-transform ${isActive ? 'scale-105' : 'opacity-65'}`}>
                  {item.icon}
                </span>
                <span className={`mt-1 text-[9px] font-black leading-none ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Add Button - Only show on desktop */}
      <button
        onClick={onAddPress}
        className="hidden sm:flex fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all z-50"
        aria-label="Tambah anggota"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
