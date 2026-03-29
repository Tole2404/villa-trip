'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { MemberCard } from '@/components/MemberCard';
import { MobileMemberCard } from '@/components/MobileMemberCard';
import { MemberForm } from '@/components/MemberForm';
import { StatsCard } from '@/components/StatsCard';
import { Itinerary } from '@/components/Itinerary';
import { MobileLayout } from '@/components/MobileLayout';

export default function Home() {
  const { members, loaded, addMember, updateMember, deleteMember, addPayment, deletePayment, getPayments, stats } = useMembers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'members' | 'itinerary' | 'stats'>('home');
  const [filter, setFilter] = useState<'all' | 'pending' | 'dp' | 'savings' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'name_asc' | 'name_desc' | 'remaining_desc' | 'paid_desc'>('created_desc');

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>

                <div className="space-y-2 mb-4">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gray-300 h-2 w-1/2 animate-pulse" />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="h-9 flex-1 min-w-[120px] bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const filteredMembers = members.filter((m) => {
    if (selectedMemberId && m.id !== selectedMemberId) return false;
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedMembers = normalizedQuery
    ? filteredMembers.filter((m) => {
        const name = m.name.toLowerCase();
        const phone = (m.phone ?? '').toLowerCase();
        return name.includes(normalizedQuery) || phone.includes(normalizedQuery);
      })
    : filteredMembers;

  const sortedMembers = [...searchedMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'remaining_desc':
        return b.remaining - a.remaining;
      case 'paid_desc':
        return b.total_paid - a.total_paid;
      case 'created_desc':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const filterButtons = [
    { key: 'all', label: 'Semua', count: members.length },
    { key: 'pending', label: 'Belum DP', count: members.filter(m => m.status === 'pending').length },
    { key: 'dp', label: 'DP Only', count: members.filter(m => m.status === 'dp_only').length },
    { key: 'savings', label: 'Nabung', count: members.filter(m => m.status === 'savings').length },
    { key: 'completed', label: 'Lunas', count: members.filter(m => m.status === 'completed').length },
  ] as const;

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Statistik Trip</h2>
            <StatsCard stats={stats} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Target</span>
                  <span className="font-semibold">Rp {stats.totalTarget.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sudah Terkumpul</span>
                  <span className="font-semibold text-green-600">Rp {stats.totalCollected.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Belum Lunas</span>
                  <span className="font-semibold text-orange-600">{members.length - stats.fullyPaid} orang</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'itinerary':
        return (
          <div className="h-[calc(100vh-200px)]">
            <Itinerary onClose={() => setActiveTab('home')} />
          </div>
        );
      
      case 'members':
        return (
          <>
            {/* Members-only view - No stats, just members */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Anggota ({sortedMembers.length})</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pembayaran dan status anggota</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama..."
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_desc">Terbaru</option>
                  <option value="name_asc">A-Z</option>
                  <option value="remaining_desc">Sisa ↓</option>
                </select>
              </div>
              
              {/* Quick filter chips */}
              <div className="flex gap-1.5 overflow-  x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setFilter(btn.key as typeof filter)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      filter === btn.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {btn.label} {btn.count > 0 && `(${btn.count})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
              {sortedMembers.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada anggota</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {sortedMembers.map((member) => (
                      <MobileMemberCard
                        key={member.id}
                        member={member}
                        onUpdate={updateMember}
                        onDelete={deleteMember}
                        onAddPayment={addPayment}
                        onDeletePayment={deletePayment}
                        getPayments={getPayments}
                      />
                    ))}
                  </div>
                  {/* Desktop Cards */}
                  <div className="hidden sm:contents">
                    {sortedMembers.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onUpdate={updateMember}
                        onDelete={deleteMember}
                        onAddPayment={addPayment}
                        onDeletePayment={deletePayment}
                        getPayments={getPayments}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        );
      
      case 'home':
      default:
        return (
          <>
            {/* Home view - Full overview with stats */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Villa Trip</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{members.length} anggota • Rp {(stats.totalCollected / 1000000).toFixed(1)}M terkumpul</p>
            </div>

            {/* Stats Card */}
            <div className="mb-4">
              <StatsCard stats={stats} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('members')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <span>👥</span> Lihat Anggota
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <span>📊</span> Statistik
              </button>
            </div>

            {/* Recent Members Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Anggota Terbaru</h3>
                <button 
                  onClick={() => setActiveTab('members')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                >
                  Lihat Semua →
                </button>
              </div>
              
              <div className="space-y-2">
                {sortedMembers.slice(0, 3).map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.status === 'completed' ? '✅ Lunas' : 
                         member.status === 'pending' ? '⚠️ Belum DP' : 
                         member.status === 'dp_only' ? '💰 DP Only' : '💵 Nabung'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Rp {(member.total_paid / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        / Rp {(member.target_amount / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
                {sortedMembers.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    Belum ada anggota
                  </p>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <MobileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddPress={() => setShowAddForm(true)}
    >
      {renderContent()}

      {/* Add Member Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-auto relative z-[101]">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Tambah Anggota Baru</h3>
            <MemberForm
              onSubmit={(data) => {
                addMember({
                  name: data.name,
                  phone: data.phone,
                  targetAmount: data.target_amount,
                  dpAmount: data.dp_amount,
                });
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Itinerary Modal for non-mobile */}
      {showItinerary && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowItinerary(false);
          }}
        >
          <Itinerary onClose={() => setShowItinerary(false)} />
        </div>
      )}
    </MobileLayout>
  );
}
