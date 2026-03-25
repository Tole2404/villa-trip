'use client';

import { useState } from 'react';
import { useMembers } from '@/hooks/useMembers';
import { MemberCard } from '@/components/MemberCard';
import { MemberForm } from '@/components/MemberForm';
import { StatsCard } from '@/components/StatsCard';

export default function Home() {
  const { members, loaded, addMember, updateMember, deleteMember, addPayment, deletePayment, getPayments, stats } = useMembers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'dp' | 'savings' | 'completed'>('all');

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const filteredMembers = members.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const filterButtons = [
    { key: 'all', label: 'Semua', count: members.length },
    { key: 'pending', label: 'Belum DP', count: members.filter(m => m.status === 'pending').length },
    { key: 'dp', label: 'DP Only', count: members.filter(m => m.status === 'dp_only').length },
    { key: 'savings', label: 'Nabung', count: members.filter(m => m.status === 'savings').length },
    { key: 'completed', label: 'Lunas', count: members.filter(m => m.status === 'completed').length },
  ] as const;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Villa Trip Manager</h1>
          <p className="text-gray-600">Kelola anggota, DP, dan pembayaran untuk acara villa</p>
        </div>

        <div className="mb-8">
          <StatsCard stats={stats} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === btn.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.label}
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  filter === btn.key ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Daftar Anggota ({filteredMembers.length})
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Anggota
          </button>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">
              {filter === 'all' ? 'Belum ada anggota. Tambahkan anggota pertama!' : 'Tidak ada anggota dengan status ini.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Tambah Anggota
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
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
        )}

        {showAddForm && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddForm(false);
            }}
          >
            <div className="bg-white rounded-xl p-6 max-w-md w-full relative z-[101]">
              <h3 className="text-lg font-semibold mb-4">Tambah Anggota Baru</h3>
              <MemberForm
                onSubmit={(data) => {
                  addMember(data);
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
