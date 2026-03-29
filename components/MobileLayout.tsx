'use client';

import { ReactNode } from 'react';

interface MobileNavProps {
  children: ReactNode;
  activeTab: 'home' | 'members' | 'itinerary' | 'stats';
  onTabChange: (tab: 'home' | 'members' | 'itinerary' | 'stats') => void;
  onAddPress: () => void;
}

export function MobileLayout({ 
  children, 
  activeTab, 
  onTabChange,
  onAddPress
}: MobileNavProps) {
  const navItems: Array<{id: 'home' | 'members' | 'add' | 'itinerary' | 'stats', label: string, icon: string, isAction?: boolean}> = [
    { id: 'home', label: 'Beranda', icon: '🏠' },
    { id: 'members', label: 'Anggota', icon: '👥' },
    { id: 'add', label: 'Tambah', icon: '➕', isAction: true },
    { id: 'itinerary', label: 'Itinerary', icon: '📋' },
    { id: 'stats', label: 'Statistik', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 transition-colors duration-200">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Villa Trip</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden sm:block sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Villa Trip Manager</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kelola anggota & pembayaran</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {children}
      </div>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 sm:hidden z-50 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onAddPress}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 dark:shadow-blue-500/30 active:scale-95 transition-transform">
                    <span className="text-2xl text-white">{item.icon}</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">{item.label}</span>
                </button>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.id !== 'add' && onTabChange(item.id as 'home' | 'members' | 'itinerary' | 'stats')}
                className="flex flex-col items-center justify-center py-1 px-3 min-w-[60px]"
              >
                <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'opacity-70'}`}>
                  {item.icon}
                </span>
                <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
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
        className="hidden sm:flex fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
