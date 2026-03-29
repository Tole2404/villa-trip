'use client';

import { useState } from 'react';
import { MemberWithStatus, Payment } from '@/types';

interface MobileMemberCardProps {
  member: MemberWithStatus;
  onUpdate: (id: string, updates: { name: string; phone?: string; targetAmount: number; dpAmount: number }) => void;
  onDelete: (id: string) => void;
  onAddPayment: (memberId: string, payment: { type: 'dp' | 'savings' | 'full'; amount: number; date: string; note?: string }) => void;
  onDeletePayment: (memberId: string, paymentId: string) => void;
  getPayments: (memberId: string) => Promise<Payment[]>;
}

const statusConfig = {
  pending: { text: 'Belum DP', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: '⚠️' },
  dp_only: { text: 'DP Only', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: '💰' },
  savings: { text: 'Nabung', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: '💵' },
  completed: { text: 'Lunas', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: '✅' },
};

export function MobileMemberCard({ member, onDelete, onAddPayment }: MobileMemberCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const status = statusConfig[member.status];
  const progress = Math.min(100, (member.total_paid / member.target_amount) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-transform">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{member.phone || '-'}</p>
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1`}>
            <span>{status.icon}</span>
            <span className="hidden sm:inline">{status.text}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Rp {(member.target_amount / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <p className="text-xs text-green-600 dark:text-green-400">Terbayar</p>
            <p className="font-bold text-green-700 dark:text-green-400 text-sm">Rp {(member.total_paid / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
            <p className="text-xs text-orange-600 dark:text-orange-400">Sisa</p>
            <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">Rp {(member.remaining / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onAddPayment(member.id, { type: 'savings', amount: member.remaining, date: new Date().toISOString().split('T')[0] })}
          className="flex-1 py-3 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>💳</span>
          Bayar
        </button>
        <div className="w-px bg-gray-100 dark:bg-gray-700" />
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>⋮</span>
          Lainnya
        </button>
      </div>

      {/* Expanded Actions */}
      {showActions && (
        <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
          <div className="flex gap-2">
            <button
              onClick={() => { onAddPayment(member.id, { type: 'dp', amount: member.dp_amount, date: new Date().toISOString().split('T')[0] }); setShowActions(false); }}
              className="flex-1 py-2 px-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium active:scale-95 transition-transform"
            >
              Bayar DP
            </button>
            <button
              onClick={() => { onAddPayment(member.id, { type: 'full', amount: member.remaining, date: new Date().toISOString().split('T')[0] }); setShowActions(false); }}
              className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium active:scale-95 transition-transform"
            >
              Pelunasan
            </button>
            <button
              onClick={() => { if (confirm('Yakin hapus?')) onDelete(member.id); setShowActions(false); }}
              className="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium active:scale-95 transition-transform"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
