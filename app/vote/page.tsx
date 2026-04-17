'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VillaPolling, Vote } from '@/types';
import { useMembers } from '@/hooks/useMembers';

export default function VotePage() {
  const router = useRouter();
  const { members, loaded: membersLoaded } = useMembers();

  const [pollings, setPollings] = useState<VillaPolling[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('voter_member_id');
    if (saved) setSelectedMemberIdState(saved);
    setIsInitialized(true);
  }, []);

  const setSelectedMemberId = (id: string | null) => {
    setSelectedMemberIdState(id);
    if (id) {
      localStorage.setItem('voter_member_id', id);
    } else {
      localStorage.removeItem('voter_member_id');
    }
  };

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

  const handleVoteSubmit = async (villaId: string) => {
    if (!selectedMemberId || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: selectedMemberId, villaId }),
      });
      if (!response.ok) throw new Error('Failed to submit vote');

      await fetchData();
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Gagal merekam suara. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isInitialized || !membersLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <img src="/img/biel.jpeg" alt="Loading" className="w-32 h-32 rounded-full object-cover animate-bounce shadow-xl border-4 border-blue-500 mb-4" />
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">loading cik😹😹😹</p>
      </div>
    );
  }

  // STEP 1: Select Member
  if (!selectedMemberId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Voting Villa Trip</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Masuk sebagai anggota untuk mulai voting</p>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {members.length === 0 ? (
              <p className="text-center text-sm text-gray-500">Belum ada anggota yang terdaftar.</p>
            ) : (
              [...members].sort((a, b) => a.name.localeCompare(b.name)).map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white flex-1">{member.name}</span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => router.push('/')}
              className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Voting Interface
  const currentMember = members.find(m => m.id === selectedMemberId);
  const activePollings = pollings.filter(p => p.isActive).sort((a, b) => {
    if (a.id === 'protest-vote') return 1;
    if (b.id === 'protest-vote') return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {actionLoading && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="font-medium text-gray-800 dark:text-gray-200">Memproses...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedMemberId(null)}
              className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Memilih sebagai</p>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{currentMember?.name}</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ke Beranda
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pt-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pilih Villa Favoritmu</h2>
          <p className="text-gray-600 dark:text-gray-400">1 Orang = 1 Suara. Jika kamu pilih villa lain, suara otomatis berpindah.</p>
        </div>

        {activePollings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Belum ada villa yang tersedia untuk di-vote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activePollings.map(polling => {
              const villaVotes = votes.filter(v => v.villaId === polling.id);
              const hasVotedThis = villaVotes.some(v => v.memberId === selectedMemberId);

              const formatPrice = (price: number) => {
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(price);
              };

              return (
                <div
                  key={polling.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all ${hasVotedThis
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-gray-100 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="relative h-48 sm:h-56">
                    {polling.imageUrls && polling.imageUrls.length > 0 ? (
                      <img src={polling.imageUrls[0]} alt={polling.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Vote Count Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <span className="text-xl">👍</span>
                      <span className="font-bold text-gray-900 dark:text-white">{villaVotes.length} Suara</span>
                    </div>

                    {hasVotedThis && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Pilihanmu
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{polling.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">{formatPrice(polling.price)}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Kapasitas {polling.capacity} orang</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                      <button
                        onClick={() => handleVoteSubmit(polling.id)}
                        disabled={actionLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${hasVotedThis
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                          }`}
                      >
                        {hasVotedThis ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            Batal Vote
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            Vote Villa
                          </>
                        )}
                      </button>
                      <a
                        href={`/polling/${polling.id}`}
                        className="py-3 px-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                      >
                        Detail
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
