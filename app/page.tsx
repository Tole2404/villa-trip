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

type AppTab = 'home' | 'members' | 'itinerary' | 'stats' | 'polling' | 'calculator' | 'monitoring' | 'expenses';
type MemberFilter = 'all' | 'pending' | 'dp' | 'savings' | 'completed';
type SortOption = 'created_desc' | 'name_asc' | 'name_desc' | 'remaining_desc' | 'paid_desc';

const formatShortCurrency = (amount: number) => {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1).replace('.', ',')} jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)} rb`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

const memberStatusCopy = {
  completed: 'Lunas',
  pending: 'Belum DP',
  dp: 'Sudah DP',
  savings: 'Nabung',
} as const;

const memberStatusTone = {
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  pending: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  dp: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  savings: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
} as const;

const quickActionTone = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 dark:hover:bg-blue-500/15',
  rose: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 dark:hover:bg-rose-500/15',
  amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 dark:hover:bg-amber-500/15',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 dark:hover:bg-emerald-500/15',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 dark:hover:bg-indigo-500/15',
  violet: 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20 dark:hover:bg-violet-500/15',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
} as const;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get('tab') as AppTab | null;
  const { members, loaded, addMember, updateMember, deleteMember, addPayment, deletePayment, getPayments, stats } = useMembers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  const [activeTab, setActiveTabState] = useState<AppTab>(tabParam || 'home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showExpensePopup, setShowExpensePopup] = useState(false);
  const { totalSpent, expenses } = useExpenses();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;

    const getTabFromHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) return null;
      const normalized = hash.startsWith('tab=') ? hash.slice(4) : hash;
      return normalized as typeof activeTab;
    };

    const syncFromHash = () => {
      const t = getTabFromHash();
      if (!t) return;
      setActiveTabState(t);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches) {
      return;
    }

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
      // Mobile Safari/Chrome + Next dev overlay can throw inside History.pushState.
      // For mobile bottom-nav tab switches, keep it state-only (no URL sync) to avoid crashes.
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches) {
        const hash = tab === 'home' ? '' : tab;
        if (window.location.hash.replace('#', '') !== hash) {
          window.location.hash = hash;
        }
        return;
      }

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

  const [filter, setFilter] = useState<MemberFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');

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

  const completionRate = stats.totalMembers > 0 ? Math.round((stats.fullyPaid / stats.totalMembers) * 100) : 0;
  const balance = stats.totalCollected - totalSpent;
  const latestMembers = [...members]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const quickActions: Array<{
    tab: AppTab;
    icon: string;
    label: string;
    description: string;
    tone: keyof typeof quickActionTone;
  }> = [
    { tab: 'members', icon: '👥', label: 'Anggota', description: `${members.length} peserta`, tone: 'blue' },
    { tab: 'expenses', icon: '💰', label: 'Pengeluaran', description: formatShortCurrency(totalSpent), tone: 'rose' },
    { tab: 'calculator', icon: '🧮', label: 'Kalkulasi', description: `${completionRate}% lunas`, tone: 'amber' },
    { tab: 'polling', icon: '🏡', label: 'Polling', description: 'Pilih villa', tone: 'emerald' },
    { tab: 'monitoring', icon: '📋', label: 'Checklist', description: 'Persiapan trip', tone: 'indigo' },
    { tab: 'stats', icon: '📊', label: 'Statistik', description: formatShortCurrency(balance), tone: 'violet' },
    { tab: 'itinerary', icon: '📜', label: 'Rundown', description: 'Agenda acara', tone: 'slate' },
  ];


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
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Analytics</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Statistik Trip 📊</h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-400">Data real-time keuangan dan progres pembayaran.</p>
              </div>
              <NotificationBell />
            </div>
            <DetailedStats members={members} stats={stats} />
          </div>
        );

      case 'itinerary':
        return (
          <div className="space-y-4">
            <Itinerary 
              onClose={() => setActiveTab('home')} 
              isAdmin={isAdminAuthenticated}
            />
          </div>
        );

      case 'members':
        return (
          <>
            {/* Members-only view - No stats, just members */}
            <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Anggota</p>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Daftar Peserta ({sortedMembers.length})</h2>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-400">Kelola pembayaran, DP, dan status peserta.</p>
              </div>
              <NotificationBell />
            </div>

            {/* Search & Filter */}
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-4">
              <div className="grid gap-2 sm:grid-cols-[1fr_180px_180px]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama atau nomor HP..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700" aria-label="Hapus pencarian">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:bg-gray-900"
                >
                  <option value="">Semua anggota</option>
                  {[...members].sort((a, b) => a.name.localeCompare(b.name)).map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:bg-gray-900"
                >
                  <option value="created_desc">Terbaru</option>
                  <option value="name_asc">A-Z</option>
                  <option value="name_desc">Z-A</option>
                  <option value="remaining_desc">Sisa ↓</option>
                  <option value="paid_desc">Terbayar ↓</option>
                </select>
              </div>

              {/* Quick filter chips */}
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setFilter(btn.key as MemberFilter)}
                    className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition-colors whitespace-nowrap ${filter === btn.key
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-gray-800">
                    <svg className="h-8 w-8 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">Tidak ada anggota yang cocok.</p>
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
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-500/20 dark:bg-gray-900">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-5 text-white sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">Villa Trip</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Halo, Cikkk! 😼</h1>
                    <p className="mt-1 max-w-xl text-sm font-medium text-blue-100">Cek progres pembayaran, kas, dan persiapan trip kita di sini.</p>
                  </div>
                  <div className="rounded-full bg-white/10 p-1 backdrop-blur">
                    <NotificationBell />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                    <p className="text-[9px] font-black uppercase tracking-wider text-blue-100">Peserta</p>
                    <p className="mt-1 text-lg font-black">{stats.totalMembers}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                    <p className="text-[9px] font-black uppercase tracking-wider text-blue-100">Lunas</p>
                    <p className="mt-1 text-lg font-black">{completionRate}%</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                    <p className="text-[9px] font-black uppercase tracking-wider text-blue-100">Sisa Kas</p>
                    <p className="mt-1 truncate text-lg font-black">{formatShortCurrency(balance)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all active:scale-[0.99] dark:border-gray-800 dark:bg-gray-900" onClick={() => setActiveTab('monitoring')}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Milestone</p>
                  <h2 className="text-base font-black text-slate-950 dark:text-white">Persiapan Trip</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">Kelola →</span>
              </div>
              <MonitoringSummary />
            </section>

            <StatsCard
              stats={{ ...stats, totalSpent }}
              onShowExpenses={() => setShowExpensePopup(true)}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Menu Cepat</p>
                  <h2 className="text-base font-black text-slate-950 dark:text-white">Akses utama</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickActions.map((action) => (
                  <button
                    key={action.tab}
                    onClick={() => setActiveTab(action.tab)}
                    className={`min-h-[86px] rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${quickActionTone[action.tone]}`}
                  >
                    <span className="text-xl leading-none">{action.icon}</span>
                    <span className="mt-2 block text-sm font-black leading-tight">{action.label}</span>
                    <span className="mt-1 block truncate text-[11px] font-semibold opacity-75">{action.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-gray-400">Update</p>
                  <h3 className="font-black text-slate-950 dark:text-white">Anggota Terbaru</h3>
                </div>
                <button
                  onClick={() => setActiveTab('members')}
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
                >
                  Lihat Semua →
                </button>
              </div>

              <div className="space-y-2">
                {latestMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-gray-800/70"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-black text-white shadow-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950 dark:text-white">{member.name}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${memberStatusTone[member.status]}`}>
                        {memberStatusCopy[member.status]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-950 dark:text-white">
                        {formatShortCurrency(member.total_paid)}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400">
                        dari {formatShortCurrency(member.target_amount)}
                      </p>
                    </div>
                  </div>
                ))}
                {latestMembers.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center dark:border-gray-700">
                    <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">Belum ada anggota.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <MobileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddPress={() => setShowAddForm(true)}
    >
      <div aria-busy={isPending} className={`transition-opacity duration-200 ${isPending ? 'opacity-80' : 'opacity-100'}`}>
        {renderContent()}
      </div>

      {/* Expense Details Popup */}
      {showExpensePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-10 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-gray-800">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">Dana Keluar</p>
                <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Rincian Pengeluaran</h3>
                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-gray-400">Total Rp {totalSpent.toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setShowExpensePopup(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" aria-label="Tutup rincian pengeluaran">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5 no-scrollbar">
              {expenses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-gray-700">
                  <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">Belum ada rincian pengeluaran.</p>
                </div>
              ) : (
                [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-800/70">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm dark:bg-gray-900">
                        {e.category === 'villa' ? '🏡' : e.category === 'transport' ? '🚗' : e.category === 'konsumsi' ? '🍽️' : '📦'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black leading-tight text-slate-950 dark:text-white">{e.name || 'Tanpa Keterangan'}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">{new Date(e.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {e.category}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-black text-rose-600 dark:text-rose-400">-{e.amount.toLocaleString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 p-5 dark:border-gray-800">
              <button
                onClick={() => {
                  setShowExpensePopup(false);
                  setActiveTab('expenses');
                }}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-blue-700 active:scale-[0.99]"
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <div className="relative z-[101] max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Anggota</p>
                <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Tambah Anggota Baru</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Tutup form tambah anggota">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
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
          <Itinerary 
            onClose={() => setShowItinerary(false)} 
            isAdmin={isAdminAuthenticated}
          />
        </div>
      )}
    </MobileLayout>
  );
}

function AdminLock({ onUnlock }: { onUnlock: () => void }) {
  const [passwordInput, setPasswordInput] = useState('');

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute right-0 top-0 p-8 opacity-5">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" /></svg>
        </div>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-300">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>

        <h2 className="mb-2 text-2xl font-black text-slate-950 dark:text-white">Akses Terkunci</h2>
        <p className="mb-8 text-sm font-medium text-slate-500 dark:text-gray-400">Hanya panitia inti yang bisa akses keuangan & polling.</p>

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
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 text-center text-lg font-black tracking-[0.45em] outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-900"
            autoFocus
          />
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99]">
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
    <div className="relative space-y-4">
      {actionLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px] dark:bg-gray-950/70">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-sm font-bold text-slate-700 dark:text-gray-200">Memproses...</span>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Admin Polling</p>
          <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">Polling Villa</h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-gray-400">{pollings.length} pilihan villa tersedia.</p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={actionLoading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Tambah Villa</span>
        </button>
      </div>

      {/* Voting Portal Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-sm shadow-blue-500/20 sm:p-5 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-black">Ayo Vote Villa Favoritmu! 🏖️</h3>
          <p className="mt-1 text-sm font-medium text-blue-100">Ruang voting punya halaman khusus yang lebih fokus.</p>
        </div>
        <button
          onClick={() => router.push('/vote')}
          className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-3 font-black text-blue-700 transition-colors hover:bg-blue-50 active:scale-[0.99] md:w-auto"
        >
          Masuk Ruang Voting
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      {pollings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <svg className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-semibold text-slate-500 dark:text-gray-400">Belum ada villa yang ditambahkan</p>
          <button
            onClick={handleAddNew}
            disabled={actionLoading}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tambah Villa Pertama
          </button>
          <button
            onClick={fetchData}
            disabled={actionLoading}
            className="mt-2 px-4 py-2 text-sm font-bold text-slate-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-300"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-6">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setManagingVotes(null);
          }}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-fade-in dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Voting</p>
                <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Kelola Suara</h3>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-500 dark:text-gray-400">{managingVotes.name}</p>
              </div>
              <button onClick={() => setManagingVotes(null)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" aria-label="Tutup kelola suara">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
              {votes.filter(v => v.villaId === managingVotes.id).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center dark:border-gray-700">
                  <p className="font-semibold text-slate-500 dark:text-gray-400">Belum ada suara untuk villa ini.</p>
                </div>
              ) : (
                votes.filter(v => v.villaId === managingVotes.id).map(vote => (
                  <div key={vote.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-white dark:border-gray-800 dark:bg-gray-800/60 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-black text-white shadow-sm">
                        {vote.member?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-gray-200">{vote.member?.name || 'Anggota Anonim'}</span>
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
                      className="rounded-lg p-2.5 text-rose-500 transition-colors hover:bg-rose-50 active:scale-95 disabled:opacity-50 dark:hover:bg-rose-900/30"
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
