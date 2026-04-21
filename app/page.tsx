'use client';

import { useState, useEffect, useCallback, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMembers } from '@/hooks/useMembers';
import { MemberCard } from '@/components/MemberCard';
import { MobileMemberCard } from '@/components/MobileMemberCard';
import { MemberForm } from '@/components/MemberForm';
import { StatsCard } from '@/components/StatsCard';
import { Itinerary } from '@/components/Itinerary';
import { MobileLayout } from '@/components/MobileLayout';
import { PollingCard } from '@/components/PollingCard';
import { PollingForm } from '@/components/PollingForm';
import { PasswordModal } from '@/components/PasswordModal';
import { TripCalculator } from '@/components/TripCalculator';
import { Monitoring, MonitoringSummary } from '@/components/Monitoring';
import { DetailedStats } from '@/components/DetailedStats';
import { TripExpenses } from '@/components/TripExpenses';
import { useExpenses } from '@/hooks/useExpenses';
import { NotificationBell } from '@/components/NotificationBell';
import { VillaPolling, PollingInput, Vote } from '@/types';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get('tab') as 'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses' | null;
  const { members, loaded, addMember, updateMember, deleteMember, addPayment, deletePayment, getPayments, stats } = useMembers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [activeTab, setActiveTabState] = useState<'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses'>(tabParam || 'home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showExpensePopup, setShowExpensePopup] = useState(false);
  const { totalSpent, expenses } = useExpenses();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    } else if (!tabParam && activeTab !== 'home') {
      setActiveTabState('home');
    }
  }, [tabParam, activeTab]);

  const setActiveTab = (tab: typeof activeTab) => {
    if (tab === activeTab || !isMounted) return;

    // Update local state immediately for snappy UI
    setActiveTabState(tab);

    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (tab === 'home') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    });
  };

  const [filter, setFilter] = useState<'all' | 'pending' | 'dp' | 'savings' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'name_asc' | 'name_desc' | 'remaining_desc' | 'paid_desc'>('name_asc');

  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <img src="/img/biel.jpeg" alt="Loading" className="w-32 h-32 rounded-full object-cover animate-bounce shadow-xl border-4 border-blue-500 mb-4" />
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">loading cik😹😹😹</p>
      </div>
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
    { key: 'dp', label: 'Sudah DP', count: members.filter(m => m.status === 'dp').length },
    { key: 'savings', label: 'Nabung', count: members.filter(m => m.status === 'savings').length },
    { key: 'completed', label: 'Lunas', count: members.filter(m => m.status === 'completed').length },
  ] as const;


  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'expenses':
        if (!isAdminAuthenticated) return <AdminLock onUnlock={() => setIsAdminAuthenticated(true)} />;
        return <TripExpenses totalCollected={stats.totalCollected} onClose={() => setActiveTab('home')} />;

      case 'calculator':
        return (
          <TripCalculator
            totalTarget={stats.totalTarget}
            totalCollected={stats.totalCollected}
            memberCount={members.length}
            onClose={() => setActiveTab('home')}
          />
        );

      case 'monitoring':
        return <Monitoring />;

      case 'polling':
        return <PollingDashboard isAdminAuthenticated={isAdminAuthenticated} onUnlock={() => setIsAdminAuthenticated(true)} />;

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Analytics 📊</h2>
                <p className="text-xs text-gray-500 font-medium">Data real-time keuangan villa trip.</p>
              </div>
              <NotificationBell />
            </div>
            <DetailedStats members={members} stats={stats} />
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Anggota ({sortedMembers.length})</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pembayaran dan status anggota</p>
              </div>
              <NotificationBell />
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
              <div className="flex gap-1.5 flex-wrap pb-1">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setFilter(btn.key as typeof filter)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === btn.key
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Halo, Cikkk! 😼</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cek progres villa trip kita di sini.</p>
              </div>
              <NotificationBell />
            </div>

            {/* Highlight Progress (Hanya yang sudah diceklis) */}
            <div className="mb-6 cursor-pointer active:scale-95 transition-all" onClick={() => setActiveTab('monitoring')}>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-tighter mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                Milestone Persiapan
              </h2>
              <MonitoringSummary />
              <p className="text-[9px] text-slate-500 text-center mt-2 italic">Ketuk untuk kelola semua persiapan →</p>
            </div>

            <div className="mb-4">
              <StatsCard
                stats={{ ...stats, totalSpent }}
                onShowExpenses={() => setShowExpensePopup(true)}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('members')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
              >
                <span>👥</span> Anggota
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/10 active:scale-95 transition-all"
              >
                <span>💰</span> Pengeluaran
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-orange-500/10 active:scale-95 transition-all"
              >
                <span>🧮</span> Kalkulasi
              </button>
              <button
                onClick={() => setActiveTab('polling')}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-500/10 active:scale-95 transition-all"
              >
                <span>🏡</span> Polling
              </button>
              <button
                onClick={() => setActiveTab('monitoring')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-500/10 active:scale-95 transition-all"
              >
                <span>📋</span> Checklist
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 shadow-lg shadow-purple-500/10 active:scale-95 transition-all"
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
                            member.status === 'dp' ? '💰 Sudah DP' : '💵 Nabung'}
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

      {/* Expense Details Popup */}
      {showExpensePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in transition-all">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="p-6 pb-2 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Rincian Dana Keluar</h3>
                <p className="text-[10px] text-rose-400 font-bold tracking-tight">TOTAL: Rp {totalSpent.toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setShowExpensePopup(false)} className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar space-y-3">
              {expenses.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 text-xs italic">Belum ada rincian pengeluaran.</p>
                </div>
              ) : (
                [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                        {e.category === 'villa' ? '🏡' : e.category === 'transport' ? '🚗' : e.category === 'konsumsi' ? '🍽️' : '📦'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{e.name || 'Tanpa Keterangan'}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{new Date(e.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {e.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-rose-400">-{e.amount.toLocaleString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setShowExpensePopup(false);
                  setActiveTab('expenses');
                }}
                className="w-full bg-slate-800 text-white/70 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-700 transition-all active:scale-95 border border-white/5"
              >
                Kelola Semua Pengeluaran →
              </button>
            </div>
          </div>
        </div>
      )}

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
              onSubmit={async (data) => {
                const doAdd = async () => {
                  setIsAddingMember(true);
                  try {
                    await addMember({
                      name: data.name,
                      phone: data.phone,
                      targetAmount: data.target_amount,
                      dpAmount: data.dp_amount,
                    });
                    setShowAddForm(false);
                  } catch (error) {
                    console.error('Error adding member:', error);
                    alert('Gagal menambahkan anggota. Coba lagi ya.');
                  } finally {
                    setIsAddingMember(false);
                  }
                };
                setPendingAction(() => doAdd);
                setShowPasswordModal(true);
              }}
              onCancel={() => setShowAddForm(false)}
              disabled={isAddingMember}
            />
          </div>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPendingAction(null);
        }}
        onSubmit={() => {
          setShowPasswordModal(false);
          pendingAction?.();
          setPendingAction(null);
        }}
        title="Verifikasi Password"
      />

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

function AdminLock({ onUnlock }: { onUnlock: () => void }) {
  const [passwordInput, setPasswordInput] = useState('');

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" /></svg>
        </div>

        <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Akses Terkunci</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm font-medium">Hanya panitia inti yang bisa akses keuangan & polling.</p>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (passwordInput === 'toleganteng') onUnlock();
          else {
            alert('Password salah!');
            setPasswordInput('');
          }
        }} className="space-y-4">
          <input
            type="password"
            placeholder="Password Admin"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-2xl outline-none text-center font-black tracking-[0.5em] text-lg transition-all"
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">
            Buka Akses
          </button>
        </form>
      </div>
    </div>
  );
}

// Polling Dashboard Component moved out of HomeContent
function PollingDashboard({ isAdminAuthenticated, onUnlock }: { isAdminAuthenticated: boolean, onUnlock: () => void }) {
  const router = useRouter();
  const [pollings, setPollings] = useState<VillaPolling[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPollingForm, setShowPollingForm] = useState(false);
  const [editingPolling, setEditingPolling] = useState<VillaPolling | null>(null);
  const [managingVotes, setManagingVotes] = useState<VillaPolling | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pollRes, voteRes] = await Promise.all([
        fetch('/api/pollings'),
        fetch('/api/votes')
      ]);

      if (pollRes.ok) {
        const data = await pollRes.json();
        setPollings(data);
      }
      if (voteRes.ok) {
        const data = await voteRes.json();
        setVotes(data);
      }
    } catch (error) {
      console.error('Error fetching polling data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: PollingInput) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/pollings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create polling');

      setShowPollingForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating polling:', error);
      alert('Gagal menambah villa. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data: PollingInput) => {
    if (!editingPolling) return;
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/pollings/${editingPolling.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update polling');

      setEditingPolling(null);
      setShowPollingForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error updating polling:', error);
      alert('Gagal update villa. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/pollings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete polling');

      await fetchData();
    } catch (error) {
      console.error('Error deleting polling:', error);
      alert('Gagal hapus villa. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/pollings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to toggle polling');

      await fetchData();
    } catch (error) {
      console.error('Error toggling polling:', error);
      alert('Gagal ubah status villa. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (polling: VillaPolling) => {
    setEditingPolling(polling);
    setShowPollingForm(true);
  };

  const handleAddNew = () => {
    setEditingPolling(null);
    setShowPollingForm(true);
  };

  const handleCancel = () => {
    setShowPollingForm(false);
    setEditingPolling(null);
  };

  if (!isAdminAuthenticated) {
    return <AdminLock onUnlock={onUnlock} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <img src="/img/biel.jpeg" alt="Loading" className="w-24 h-24 rounded-full object-cover animate-bounce shadow-xl border-4 border-blue-500 mb-4" />
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 animate-pulse">loading cik 😹😹😹</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {actionLoading && (
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Memproses...</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Polling Villa</h2>
        <button
          onClick={handleAddNew}
          disabled={actionLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Villa
        </button>
      </div>

      {/* Voting Portal Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Ayo Vote Villa Favoritmu! 🏖️</h3>
          <p className="text-blue-100 text-sm mt-1">Sistem voting telah dipindah ke halaman khusus yang lebih bagus.</p>
        </div>
        <button
          onClick={() => router.push('/vote')}
          className="w-full md:w-auto px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          Masuk Ruang Voting
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      {pollings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Belum ada villa yang ditambahkan</p>
          <button
            onClick={handleAddNew}
            disabled={actionLoading}
            className="mt-4 px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Tambah Villa Pertama
          </button>
          <button
            onClick={fetchData}
            disabled={actionLoading}
            className="mt-2 px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollings.map((polling) => (
            <PollingCard
              key={polling.id}
              polling={polling}
              votes={votes.filter(v => v.villaId === polling.id)}
              onManageVotes={(polling) => setManagingVotes(polling)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              disabled={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Polling Form Modal */}
      {showPollingForm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-auto relative shadow-2xl">
            <PollingForm
              polling={editingPolling || undefined}
              onSubmit={editingPolling ? handleUpdate : handleCreate}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Manage Votes Modal */}
      {managingVotes && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setManagingVotes(null);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] flex flex-col relative shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kelola Suara</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{managingVotes.name}</p>
              </div>
              <button onClick={() => setManagingVotes(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {votes.filter(v => v.villaId === managingVotes.id).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Belum ada suara untuk villa ini.</p>
                </div>
              ) : (
                votes.filter(v => v.villaId === managingVotes.id).map(vote => (
                  <div key={vote.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {vote.member?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{vote.member?.name || 'Anggota Anonim'}</span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`Hapus suara dari ${vote.member?.name}?`)) return;
                        setActionLoading(true);
                        try {
                          const res = await fetch(`/api/votes?id=${vote.id}`, { method: 'DELETE' });
                          if (res.ok) await fetchData();
                          else alert('Gagal menghapus suara');
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                      title="Hapus Suara"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
